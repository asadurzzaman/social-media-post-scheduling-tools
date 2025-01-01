import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { postId } = await req.json()
    
    if (!postId) {
      throw new Error('Post ID is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get post details including the social account
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select(`
        *,
        social_accounts (
          access_token
        )
      `)
      .eq('id', postId)
      .single()

    if (postError) throw postError
    if (!post) throw new Error('Post not found')
    if (!post.social_accounts?.access_token) throw new Error('LinkedIn access token not found')

    // Add required LinkedIn API version headers
    const linkedInHeaders = {
      'Authorization': `Bearer ${post.social_accounts.access_token}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202304',
    }

    // First, get the LinkedIn member ID
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: linkedInHeaders,
    })

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('LinkedIn profile API error:', errorText)
      throw new Error(`LinkedIn profile API error: ${errorText}`)
    }

    const profileData = await profileResponse.json()
    const memberId = profileData.id

    let postData: any = {
      author: `urn:li:person:${memberId}`,
      commentary: post.content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    }

    // Handle image upload if present
    if (post.image_url) {
      try {
        // Download image from Supabase Storage
        const imageUrl = post.image_url.replace(/^https:\/\/[^/]+\.supabase\.co/, Deno.env.get('SUPABASE_URL') || '')
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) throw new Error('Failed to fetch image from storage')
        const imageBlob = await imageResponse.blob()

        // Register upload
        const registerResponse = await fetch(
          'https://api.linkedin.com/v2/assets?action=registerUpload',
          {
            method: 'POST',
            headers: {
              ...linkedInHeaders,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              registerUploadRequest: {
                recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                owner: `urn:li:person:${memberId}`,
                serviceRelationships: [
                  {
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent',
                  },
                ],
              },
            }),
          }
        )

        if (!registerResponse.ok) {
          throw new Error(`Failed to register upload: ${await registerResponse.text()}`)
        }

        const { value: { uploadMechanism, asset } } = await registerResponse.json()
        const { uploadUrl } = uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']

        // Upload the image
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            ...linkedInHeaders,
            'Content-Type': imageBlob.type,
          },
          body: imageBlob,
        })

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image: ${await uploadResponse.text()}`)
        }

        // Add image to post data
        postData = {
          ...postData,
          content: {
            media: {
              id: asset,
              title: {
                text: "Image"
              }
            }
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        throw error
      }
    }

    // Create the post
    const createPostResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        ...linkedInHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })

    if (!createPostResponse.ok) {
      throw new Error(`Failed to create post: ${await createPostResponse.text()}`)
    }

    // Update post status
    const { error: updateError } = await supabaseClient
      .from('posts')
      .update({ status: 'published' })
      .eq('id', postId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ message: 'Post published successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})