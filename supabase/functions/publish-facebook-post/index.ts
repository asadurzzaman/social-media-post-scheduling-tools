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

    // Get the post ID from the request
    const { postId } = await req.json();

    if (!postId) {
      throw new Error('Post ID is required');
    }

    console.log('Publishing post:', postId);

    // Fetch the post details with social account info
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select(`
        content,
        image_url,
        social_accounts!inner(
          page_id,
          page_access_token,
          requires_reconnect
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Failed to fetch post:', postError);
      throw new Error('Failed to fetch post details');
    }

    console.log('Post details:', { ...post, social_accounts: { ...post.social_accounts, page_access_token: '[REDACTED]' } });

    const pageId = post.social_accounts.page_id;
    const pageAccessToken = post.social_accounts.page_access_token;

    if (!pageId || !pageAccessToken) {
      throw new Error('Missing Facebook page credentials');
    }

    // Check if account needs reconnection
    if (post.social_accounts.requires_reconnect) {
      throw new Error('Facebook account needs to be reconnected');
    }

    // Verify token validity
    try {
      const debugTokenResponse = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${pageAccessToken}&access_token=${pageAccessToken}`
      );
      const tokenData = await debugTokenResponse.json();
      
      if (!tokenData.data?.is_valid) {
        // Update account status in database
        await supabaseClient
          .from('social_accounts')
          .update({ 
            requires_reconnect: true,
            last_error: 'Token validation failed'
          })
          .eq('page_id', pageId);
          
        throw new Error('Facebook token is invalid. Please reconnect your account.');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      throw new Error('Failed to validate Facebook token');
    }

    // Prepare the post data
    let endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
    let postData: Record<string, any> = {
      message: post.content,
      access_token: pageAccessToken,
    };

    // If there's no image, use the /feed endpoint instead
    if (!post.image_url) {
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    } else {
      // Clean and validate image URL
      const imageUrl = post.image_url.split(',')[0].trim();
      if (!imageUrl.startsWith('http')) {
        throw new Error('Invalid image URL format');
      }
      postData.url = imageUrl;
    }

    console.log('Making Facebook API request to:', endpoint);
    console.log('Post data:', { ...postData, access_token: '[REDACTED]' });

    // Make the Facebook API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API Error:', errorData);
      
      // Check if error is related to authentication
      if (errorData.error?.code === 190) {
        // Update account status in database
        await supabaseClient
          .from('social_accounts')
          .update({ 
            requires_reconnect: true,
            last_error: errorData.error.message
          })
          .eq('page_id', pageId);
      }
      
      throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Facebook API response:', result);

    // Update post status to published
    const { error: updateError } = await supabaseClient
      .from('posts')
      .update({ status: 'published' })
      .eq('id', postId);

    if (updateError) {
      console.error('Failed to update post status:', updateError);
      throw new Error('Failed to update post status');
    }

    return new Response(
      JSON.stringify({ success: true, postId: result.id }),
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