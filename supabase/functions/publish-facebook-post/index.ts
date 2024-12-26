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

    // Fetch the post details and social account info
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select(`
        content,
        image_url,
        poll_options,
        social_accounts!inner(
          page_id,
          page_access_token,
          token_expires_at
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Failed to fetch post:', postError);
      throw new Error('Failed to fetch post details');
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
    const tokenExpiresAt = post.social_accounts.token_expires_at;

    if (!pageId || !pageAccessToken) {
      throw new Error('Missing Facebook page credentials');
    }

    // Check if token is expired
    if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
      throw new Error('Facebook access token has expired. Please reconnect your Facebook account.');
    }

    let endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    let postData: Record<string, any> = {
      message: post.content,
      access_token: pageAccessToken,
    };

    // Handle different post types based on the content
    if (post.image_url) {
      const imageUrls = post.image_url.split(',');
      
      if (imageUrls.length > 1) {
        // Handle carousel post
        endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
        const mediaIds = [];
        
        // Upload each image and get media IDs
        for (const imageUrl of imageUrls) {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: imageUrl.trim(),
              access_token: pageAccessToken,
              published: false
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Facebook API Error:', errorData);
            throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
          }
          
          const result = await response.json();
          mediaIds.push(result.id);
        }
        
        // Create carousel post with all media IDs
        endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
        postData.attached_media = mediaIds.map(id => ({ media_fbid: id }));
      } else {
        // Single image/video post
        const fileExtension = imageUrls[0].split('.').pop()?.toLowerCase();
        const isVideo = fileExtension === 'mp4' || fileExtension === 'mov';
        
        if (isVideo) {
          endpoint = `https://graph.facebook.com/v18.0/${pageId}/videos`;
        } else {
          endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
        }
        postData.url = imageUrls[0].trim();
      }
    } else if (post.poll_options && post.poll_options.length > 0) {
      // Handle poll post
      postData.polling = {
        options: post.poll_options,
        duration: 86400 // 24 hours in seconds
      };
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