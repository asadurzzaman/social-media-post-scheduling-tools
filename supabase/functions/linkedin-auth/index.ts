import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    console.log('Starting LinkedIn authentication...')
    console.log('Code:', code)
    console.log('Redirect URI:', redirectUri)
    console.log('State:', state)

    // Exchange code for access token
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken'
    const tokenBody = new URLSearchParams()
    tokenBody.append('grant_type', 'authorization_code')
    tokenBody.append('code', code)
    tokenBody.append('redirect_uri', redirectUri)
    tokenBody.append('client_id', clientId)
    tokenBody.append('client_secret', clientSecret)

    console.log('Requesting access token from:', tokenUrl)
    console.log('Token request body:', tokenBody.toString())
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody.toString(),
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response status:', tokenResponse.status)
    console.log('Token response:', JSON.stringify(tokenData))
    
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Token error:', tokenData)
      throw new Error(tokenData.error_description || 'Failed to exchange code for token')
    }

    // Get user profile with the access token
    console.log('Fetching LinkedIn profile...')
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    })

    const profileData = await profileResponse.json()
    console.log('Profile response status:', profileResponse.status)
    console.log('Profile data:', JSON.stringify(profileData))
    
    if (!profileResponse.ok) {
      console.error('Profile error:', profileData)
      throw new Error('Failed to fetch LinkedIn profile')
    }

    return new Response(
      JSON.stringify({
        accessToken: tokenData.access_token,
        userId: profileData.id,
        username: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
        expiresIn: tokenData.expires_in,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('LinkedIn auth error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})