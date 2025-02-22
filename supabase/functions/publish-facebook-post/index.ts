import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { postId } = await req.json();

    if (!postId) {
      throw new Error('Post ID is required');
    }

    console.log('Publishing post:', postId);

    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select(`
        content,
        image_urls,
        social_accounts!inner(
          page_id,
          page_access_token,
          requires_reconnect,
          token_expires_at
        )
      `)
      .eq('id', postId)
      .maybeSingle();

    if (postError) {
      console.error('Database error when fetching post:', postError);
      throw new Error(`Database error: ${postError.message}`);
    }

    if (!post) {
      console.error('Post not found:', postId);
      throw new Error('Post not found');
    }

    // Check if token is expired or account needs reconnection
    const tokenExpiresAt = post.social_accounts.token_expires_at;
    if (post.social_accounts.requires_reconnect || 
        (tokenExpiresAt && new Date(tokenExpiresAt) <= new Date())) {
      await supabaseClient
        .from('social_accounts')
        .update({ requires_reconnect: true })
        .eq('page_id', post.social_accounts.page_id);
      
      throw new Error('Facebook token expired. Please reconnect your account.');
    }

    console.log('Post details:', { 
      ...post, 
      social_accounts: { 
        ...post.social_accounts, 
        page_access_token: '[REDACTED]' 
      } 
    });

    const pageId = post.social_accounts.page_id;
    const pageAccessToken = post.social_accounts.page_access_token;

    if (!pageId || !pageAccessToken) {
      throw new Error('Missing Facebook page credentials');
    }

    let endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
    let postData: any = {
      message: post.content,
      access_token: pageAccessToken,
    };

    // If no images, use /feed endpoint for text-only post
    if (!post.image_urls || post.image_urls.length === 0) {
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    } else {
      // For image posts, add the URL
      postData.url = post.image_urls[0]; // Currently only supporting first image
    }

    console.log('Making Facebook API request to:', endpoint);
    console.log('Post data:', { ...postData, access_token: '[REDACTED]' });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    const fbResponse = await response.json();

    if (!response.ok) {
      console.error('Facebook API Error:', fbResponse);
      
      // Check for token expiration in the Facebook response
      if (fbResponse.error?.code === 190) {
        await supabaseClient
          .from('social_accounts')
          .update({ requires_reconnect: true })
          .eq('page_id', pageId);
        
        throw new Error('Facebook token expired. Please reconnect your account.');
      }
      
      throw new Error(`Facebook API Error: ${JSON.stringify(fbResponse)}`);
    }

    console.log('Facebook API response:', fbResponse);

    const { error: updateError } = await supabaseClient
      .from('posts')
      .update({ status: 'published' })
      .eq('id', postId);

    if (updateError) {
      console.error('Failed to update post status:', updateError);
      throw new Error('Failed to update post status');
    }

    return new Response(
      JSON.stringify({ success: true, postId: fbResponse.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});