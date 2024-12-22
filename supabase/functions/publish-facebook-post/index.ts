import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const now = new Date();

    // Get posts that are scheduled to be published now
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        social_accounts(access_token, platform)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString());

    if (fetchError) {
      throw new Error(`Error fetching posts: ${fetchError.message}`);
    }

    console.log(`Found ${posts?.length || 0} posts to publish`);

    const results = await Promise.all((posts || []).map(async (post) => {
      if (post.social_accounts?.platform !== 'facebook') {
        console.log(`Skipping post ${post.id} - not a Facebook post`);
        return null;
      }

      const accessToken = post.social_accounts?.access_token;
      if (!accessToken) {
        console.log(`Skipping post ${post.id} - no access token`);
        return null;
      }

      try {
        // Publish to Facebook
        const fbResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/feed`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: post.content,
              access_token: accessToken,
              ...(post.image_url ? { link: post.image_url } : {}),
            }),
          }
        );

        if (!fbResponse.ok) {
          throw new Error(`Facebook API error: ${await fbResponse.text()}`);
        }

        // Update post status to published
        const { error: updateError } = await supabase
          .from('posts')
          .update({ status: 'published' })
          .eq('id', post.id);

        if (updateError) {
          throw new Error(`Error updating post status: ${updateError.message}`);
        }

        console.log(`Successfully published post ${post.id}`);
        return { id: post.id, status: 'success' };
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);
        return { id: post.id, status: 'error', error: error.message };
      }
    }));

    return new Response(
      JSON.stringify({ 
        message: 'Posts processing completed', 
        results: results.filter(Boolean)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
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