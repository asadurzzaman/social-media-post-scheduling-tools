import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting publish-facebook-post function');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get posts that are scheduled and due for publishing
    const { data: posts, error: postsError } = await supabaseClient
      .from('posts')
      .select(`
        *,
        social_accounts(access_token, platform, page_access_token, page_id)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString());

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    if (!posts || posts.length === 0) {
      console.log('No posts to publish');
      return new Response(
        JSON.stringify({ message: 'No posts to publish' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${posts.length} posts to publish`);

    const results = await Promise.all(
      posts.map(async (post) => {
        console.log(`Processing post ${post.id} for platform ${post.social_accounts.platform}`);
        
        if (post.social_accounts.platform !== 'facebook') {
          console.log(`Skipping post ${post.id} - unsupported platform ${post.social_accounts.platform}`);
          return { id: post.id, status: 'error', message: 'Unsupported platform' };
        }

        try {
          const accessToken = post.social_accounts.page_access_token || post.social_accounts.access_token;
          const endpoint = post.social_accounts.page_id 
            ? `https://graph.facebook.com/v18.0/${post.social_accounts.page_id}/feed`
            : 'https://graph.facebook.com/v18.0/me/feed';

          console.log(`Publishing to Facebook endpoint: ${endpoint}`);
          
          let body: any = {
            message: post.content,
          };

          // Handle different post types
          if (post.image_url) {
            if (post.image_url.includes(',')) {
              // Multiple images - create a carousel post
              const imageUrls = post.image_url.split(',');
              const mediaIds = await Promise.all(
                imageUrls.map(async (url) => {
                  const response = await fetch(
                    `https://graph.facebook.com/v18.0/me/photos`,
                    {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                      },
                      body: JSON.stringify({
                        url: url,
                        published: false,
                      }),
                    }
                  );
                  const result = await response.json();
                  if (result.error) throw new Error(result.error.message);
                  return result.id;
                })
              );
              
              body = {
                message: post.content,
                attached_media: mediaIds.map(id => ({ media_fbid: id })),
              };
            } else {
              // Single image
              body.link = post.image_url;
            }
          }

          console.log('Request body:', JSON.stringify(body));

          const response = await fetch(
            endpoint,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            }
          );

          const result = await response.json();
          console.log('Facebook API response:', result);

          if (!response.ok) {
            throw new Error(result.error?.message || 'Failed to publish to Facebook');
          }

          // Update post status to published
          const { error: updateError } = await supabaseClient
            .from('posts')
            .update({ status: 'published' })
            .eq('id', post.id);

          if (updateError) {
            console.error(`Error updating post ${post.id} status:`, updateError);
            throw updateError;
          }

          console.log(`Successfully published post ${post.id}`);
          return {
            id: post.id,
            status: 'published',
            facebook_post_id: result.id,
          };
        } catch (error) {
          console.error(`Error publishing post ${post.id}:`, error);
          
          // Update post status to failed
          const { error: updateError } = await supabaseClient
            .from('posts')
            .update({ status: 'failed' })
            .eq('id', post.id);

          if (updateError) {
            console.error(`Error updating post ${post.id} status to failed:`, updateError);
          }

          return {
            id: post.id,
            status: 'error',
            message: error.message,
          };
        }
      })
    );

    console.log('Finished processing all posts');
    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in publish-facebook-post function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});