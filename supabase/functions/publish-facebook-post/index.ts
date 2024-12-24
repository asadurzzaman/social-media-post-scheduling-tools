import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    // Fetch the post details
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select(`
        content,
        image_url,
        social_accounts!inner(
          page_id,
          page_access_token
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      throw new Error('Failed to fetch post details');
    }

    const pageId = post.social_accounts.page_id;
    const pageAccessToken = post.social_accounts.page_access_token;

    if (!pageId || !pageAccessToken) {
      throw new Error('Missing Facebook page credentials');
    }

    // Prepare the post data
    const postData: Record<string, any> = {
      message: post.content,
    };

    // Add image if present
    if (post.image_url) {
      const imageUrls = post.image_url.split(',');
      if (imageUrls.length > 0) {
        postData.url = imageUrls[0]; // Use the first image URL
      }
    }

    // Make the Facebook API request
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postData,
          access_token: pageAccessToken,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    // Update post status to published
    const { error: updateError } = await supabaseClient
      .from('posts')
      .update({ status: 'published' })
      .eq('id', postId);

    if (updateError) {
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});