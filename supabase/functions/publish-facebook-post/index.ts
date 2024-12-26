import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FacebookAPI } from "./facebook-api.ts";
import { Database } from "./database.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId } = await req.json();

    if (!postId) {
      throw new Error('Post ID is required');
    }

    console.log('Publishing post:', postId);

    const post = await Database.getPostDetails(postId);
    const { page_id, page_access_token, token_expires_at, user_id } = post.social_accounts;

    if (!page_id || !page_access_token) {
      throw new Error('Missing Facebook page credentials');
    }

    // Check if token is expired
    if (token_expires_at && new Date(token_expires_at) < new Date()) {
      await Database.markAccountForReconnection(
        user_id, 
        page_id, 
        'Facebook token expired. Please reconnect your account.'
      );
      throw new Error('TOKEN_EXPIRED');
    }

    let result;
    if (post.image_url) {
      const imageUrls = post.image_url.split(',');
      
      if (imageUrls.length > 1) {
        result = await FacebookAPI.publishCarousel(
          page_id,
          imageUrls,
          post.content,
          page_access_token
        );
      } else {
        const fileExtension = imageUrls[0].split('.').pop()?.toLowerCase();
        const isVideo = fileExtension === 'mp4' || fileExtension === 'mov';
        
        result = await FacebookAPI.publishSingleMedia(
          page_id,
          imageUrls[0].trim(),
          post.content,
          page_access_token,
          isVideo
        );
      }
    } else {
      result = await FacebookAPI.publishTextOrPoll(
        page_id,
        post.content,
        page_access_token,
        post.poll_options
      );
    }

    await Database.updatePostStatus(postId, 'published');

    return new Response(
      JSON.stringify({ success: true, postId: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    
    if (error.message === 'TOKEN_EXPIRED') {
      return new Response(
        JSON.stringify({ 
          error: 'Facebook token has expired. Please reconnect your Facebook account.',
          code: 'TOKEN_EXPIRED'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }
    
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