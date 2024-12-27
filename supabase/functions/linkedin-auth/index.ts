import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code, redirectUri, state } = await req.json()
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID')
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      throw new Error('LinkedIn credentials not configured')
    }

    console.log('LinkedIn Auth - Starting authentication...')
    console.log('LinkedIn Auth - Using redirect URI:', redirectUri)

    // Exchange code for access token
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken'
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    })

    console.log('LinkedIn Auth - Token request URL:', tokenUrl)
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    })

    const tokenData = await tokenResponse.json()
    console.log('LinkedIn Auth - Token response status:', tokenResponse.status)

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('LinkedIn Auth - Token error:', tokenData)
      throw new Error(tokenData.error_description || 'Failed to exchange code for token')
    }

    // Get user profile with proper API version and fields
    console.log('LinkedIn Auth - Fetching profile...')
    const profileResponse = await fetch(
      'https://api.linkedin.com/v2/userinfo', 
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Accept': 'application/json',
        },
      }
    )

    if (!profileResponse.ok) {
      console.error('LinkedIn Auth - Profile fetch failed:', await profileResponse.text())
      throw new Error('Failed to fetch LinkedIn profile')
    }

    const profileData = await profileResponse.json()
    console.log('LinkedIn Auth - Profile response status:', profileResponse.status)
    console.log('LinkedIn Auth - Profile data:', JSON.stringify(profileData))

    if (!profileData.sub) {
      console.error('LinkedIn Auth - Invalid profile data:', profileData)
      throw new Error('Invalid LinkedIn profile data')
    }

    return new Response(
      JSON.stringify({
        accessToken: tokenData.access_token,
        userId: profileData.sub,
        username: profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim(),
        expiresIn: tokenData.expires_in,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('LinkedIn Auth - Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})