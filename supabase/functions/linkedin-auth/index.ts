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

    // Since we don't have r_liteprofile scope, we'll use a generic profile name
    const timestamp = new Date().getTime()
    const genericUsername = `LinkedIn User ${timestamp}`

    return new Response(
      JSON.stringify({
        accessToken: tokenData.access_token,
        userId: timestamp.toString(), // Use timestamp as a unique identifier
        username: genericUsername,
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