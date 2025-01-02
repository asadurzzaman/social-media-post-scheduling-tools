import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId } = await req.json();

    // Fetch post data
    const { data: post, error: postError } = await supabase
      .from('facebook_posts')
      .select(`
        *,
        facebook_pages!inner(*)
      `)
      .eq('id', postId)
      .single();

    if (postError) throw postError;
    if (!post) throw new Error('Post not found');

    const page = post.facebook_pages;
    if (!page) throw new Error('Facebook page not found');

    console.log('Publishing post to Facebook:', { postId, pageId: page.page_id });

    // Prepare the Facebook API request
    const url = `https://graph.facebook.com/v19.0/${page.page_id}/feed`;
    const body: any = {
      message: post.content,
      access_token: page.page_access_token,
    };

    // If there are media URLs, attach them
    if (post.media_urls && post.media_urls.length > 0) {
      body.url = post.media_urls[0]; // Facebook only allows one media attachment per post
    }

    // Make the request to Facebook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Facebook API error:', result);
      throw new Error(result.error?.message || 'Failed to publish to Facebook');
    }

    console.log('Successfully published to Facebook:', result);

    // Update post status and store Facebook post ID
    await supabase
      .from('facebook_posts')
      .update({ 
        status: 'published',
        post_id: result.id,
        published_time: new Date().toISOString()
      })
      .eq('id', postId);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error publishing to Facebook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});