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
    const { code, redirectUri } = await req.json()
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

    // Fetch user's profile information
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    const profileData = await profileResponse.json();
    console.log('LinkedIn Auth - Profile data:', profileData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the user's ID from the authorization header
    const authHeader = req.headers.get('authorization')?.split(' ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    if (userError || !user) {
      throw new Error('Failed to get user information')
    }

    // Save the LinkedIn account information with the profile name
    const { error: insertError } = await supabase
      .from('social_accounts')
      .insert({
        user_id: user.id,
        platform: 'linkedin',
        account_name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
        access_token: tokenData.access_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      })

    if (insertError) {
      console.error('LinkedIn Auth - Insert error:', insertError)
      throw new Error('Failed to save LinkedIn account')
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile: profileData,
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