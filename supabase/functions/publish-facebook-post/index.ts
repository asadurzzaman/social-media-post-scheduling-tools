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
      .from('posts')
      .select(`
        *,
        social_accounts(*)
      `)
      .eq('id', postId)
      .single();

    if (postError) throw postError;
    if (!post) throw new Error('Post not found');

    const socialAccount = post.social_accounts;
    if (!socialAccount) throw new Error('Social account not found');

    console.log('Publishing post to Facebook:', { postId, socialAccount: socialAccount.id });

    // Prepare the Facebook API request
    const url = `https://graph.facebook.com/v19.0/${socialAccount.page_id}/feed`;
    const body: any = {
      message: post.content,
      access_token: socialAccount.page_access_token,
    };

    // If there's an image, attach it
    if (post.image_url) {
      body.url = post.image_url;
      body.link = post.image_url;
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
      
      // Check if token has expired
      if (result.error?.code === 190) {
        await supabase
          .from('social_accounts')
          .update({ 
            requires_reconnect: true,
            last_error: result.error.message
          })
          .eq('id', socialAccount.id);
        
        throw new Error('Facebook token has expired');
      }
      throw new Error(result.error?.message || 'Failed to publish to Facebook');
    }

    console.log('Successfully published to Facebook:', result);

    // Update post status
    await supabase
      .from('posts')
      .update({ status: 'published' })
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