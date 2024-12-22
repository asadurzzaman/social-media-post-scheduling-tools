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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get posts that are scheduled and due for publishing
    const { data: posts, error: postsError } = await supabaseClient
      .from('posts')
      .select(`
        *,
        social_accounts(access_token, platform)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString());

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No posts to publish' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = await Promise.all(
      posts.map(async (post) => {
        if (post.social_accounts.platform !== 'facebook') {
          return { id: post.id, status: 'error', message: 'Unsupported platform' };
        }

        try {
          // Publish to Facebook using Graph API
          const response = await fetch(
            `https://graph.facebook.com/v18.0/me/feed`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${post.social_accounts.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: post.content,
                ...(post.image_url && { link: post.image_url }),
              }),
            }
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error?.message || 'Failed to publish to Facebook');
          }

          // Update post status to published
          await supabaseClient
            .from('posts')
            .update({ status: 'published' })
            .eq('id', post.id);

          return {
            id: post.id,
            status: 'published',
            facebook_post_id: result.id,
          };
        } catch (error) {
          console.error(`Error publishing post ${post.id}:`, error);
          
          // Update post status to failed
          await supabaseClient
            .from('posts')
            .update({ status: 'failed' })
            .eq('id', post.id);

          return {
            id: post.id,
            status: 'error',
            message: error.message,
          };
        }
      })
    );

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