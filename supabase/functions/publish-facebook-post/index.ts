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
        image_url,
        post_type,
        poll_options,
        social_accounts!inner(
          id,
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

    if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
      await supabaseClient
        .from('social_accounts')
        .update({ 
          requires_reconnect: true,
          last_error: "Token expired"
        })
        .eq('id', post.social_accounts.id);

      throw new Error('Facebook token has expired. Please reconnect your account.');
    }

    // Prepare the base endpoint and post data based on post type
    let endpoint = `https://graph.facebook.com/v18.0/${pageId}/`;
    let postData: Record<string, any> = {
      access_token: pageAccessToken,
    };

    switch (post.post_type) {
      case 'image':
      case 'carousel':
        endpoint += 'photos';
        if (post.image_url) {
          const imageUrls = post.image_url.split(',');
          if (post.post_type === 'carousel' && imageUrls.length > 1) {
            // Handle carousel post
            const attachments = await Promise.all(imageUrls.map(async (url) => {
              const response = await fetch(`${endpoint}?access_token=${pageAccessToken}`, {
                method: 'POST',
                body: JSON.stringify({ url }),
              });
              const data = await response.json();
              return { media_fbid: data.id };
            }));
            
            endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
            postData = {
              access_token: pageAccessToken,
              message: post.content,
              attached_media: attachments,
            };
          } else {
            // Single image post
            postData.url = imageUrls[0];
            postData.message = post.content;
          }
        }
        break;

      case 'video':
        endpoint += 'videos';
        if (post.image_url) {
          postData.file_url = post.image_url;
          postData.description = post.content;
        }
        break;

      case 'poll':
        endpoint += 'questions';
        postData.question = post.content;
        if (post.poll_options) {
          postData.options = post.poll_options;
        }
        break;

      case 'story':
        endpoint += 'stories';
        if (post.image_url) {
          postData.file_url = post.image_url;
        }
        break;

      case 'link':
        endpoint += 'feed';
        const urlMatch = post.content.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          postData.link = urlMatch[0];
          postData.message = post.content.replace(urlMatch[0], '').trim();
        }
        break;

      case 'checkin':
        endpoint += 'feed';
        postData.message = post.content;
        postData.place = post.location_id; // Requires location_id to be passed
        break;

      case 'milestone':
        endpoint += 'milestones';
        postData.title = post.content;
        break;

      case 'tagged':
        endpoint += 'feed';
        postData.message = post.content;
        if (post.tagged_users) {
          postData.tags = post.tagged_users;
        }
        break;

      default:
        endpoint += 'feed';
        postData.message = post.content;
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

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Facebook API Error:', responseData);
      
      if (responseData.error?.code === 190) {
        await supabaseClient
          .from('social_accounts')
          .update({ 
            requires_reconnect: true,
            last_error: responseData.error.message
          })
          .eq('id', post.social_accounts.id);
      }
      
      throw new Error(`Facebook API Error: ${JSON.stringify(responseData)}`);
    }

    console.log('Facebook API response:', responseData);

    const { error: updateError } = await supabaseClient
      .from('posts')
      .update({ status: 'published' })
      .eq('id', postId);

    if (updateError) {
      console.error('Failed to update post status:', updateError);
      throw new Error('Failed to update post status');
    }

    return new Response(
      JSON.stringify({ success: true, postId: responseData.id }),
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