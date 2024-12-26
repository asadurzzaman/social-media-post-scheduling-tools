import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const { code, redirectUri } = await req.json()

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: Deno.env.get('FACEBOOK_APP_ID') || '',
        client_secret: Deno.env.get('FACEBOOK_APP_SECRET') || '',
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error.message)
    }

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${
        Deno.env.get('FACEBOOK_APP_SECRET')
      }&access_token=${tokenData.access_token}`
    )

    const longLivedTokenData = await longLivedTokenResponse.json()

    // Get user profile information
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedTokenData.access_token}`
    )

    const userData = await userResponse.json()

    return new Response(
      JSON.stringify({
        accessToken: longLivedTokenData.access_token,
        userId: userData.id,
        username: userData.username,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})