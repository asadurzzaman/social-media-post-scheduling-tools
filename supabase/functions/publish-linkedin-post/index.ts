import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { postId } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        content,
        image_url,
        social_accounts (
          access_token,
          platform
        )
      `)
      .eq('id', postId)
      .single()

    if (postError) throw postError
    if (!post) throw new Error('Post not found')
    if (!post.social_accounts?.access_token) throw new Error('LinkedIn access token not found')

    // Prepare the post content
    const postData: any = {
      author: `urn:li:person:${post.social_accounts.access_token}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    // If there's an image, upload it first
    if (post.image_url) {
      // Fetch the image
      const imageResponse = await fetch(post.image_url)
      const imageBlob = await imageResponse.blob()

      // Upload image to LinkedIn
      const registerUploadResponse = await fetch(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${post.social_accounts.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: `urn:li:person:${post.social_accounts.access_token}`,
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }]
            }
          })
        }
      )

      const uploadData = await registerUploadResponse.json()
      
      // Upload the image to LinkedIn's URL
      await fetch(uploadData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${post.social_accounts.access_token}`,
        },
        body: imageBlob
      })

      // Add the image to the post data
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE'
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        description: {
          text: 'Image'
        },
        media: uploadData.value.asset,
        title: {
          text: 'Image'
        }
      }]
    }

    // Create the post on LinkedIn
    const publishResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${post.social_accounts.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })

    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      throw new Error(`LinkedIn API error: ${JSON.stringify(error)}`)
    }

    // Update post status in database
    const { error: updateError } = await supabase
      .from('posts')
      .update({ status: 'published' })
      .eq('id', postId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error publishing to LinkedIn:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})