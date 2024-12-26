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
    
    const instagramAppId = Deno.env.get('INSTAGRAM_APP_ID')
    const instagramAppSecret = Deno.env.get('INSTAGRAM_APP_SECRET')
    
    if (!instagramAppId || !instagramAppSecret) {
      throw new Error('Instagram credentials not configured')
    }

    console.log('Exchanging code for token...');

    // Exchange the code for an access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: instagramAppId,
        client_secret: instagramAppSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('Error exchanging code for token:', tokenData)
      throw new Error(tokenData.error_message || 'Failed to exchange code for token')
    }

    console.log('Token response:', tokenData);

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${instagramAppSecret}&access_token=${tokenData.access_token}`
    );

    const longLivedTokenData = await longLivedTokenResponse.json();

    if (longLivedTokenData.error) {
      console.error('Error getting long-lived token:', longLivedTokenData);
      throw new Error('Failed to get long-lived token');
    }

    // Get user details using the access token
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedTokenData.access_token}`
    )
    
    const userData = await userResponse.json()
    
    if (userData.error) {
      console.error('Error fetching user data:', userData)
      throw new Error(userData.error.message || 'Failed to fetch user data')
    }

    console.log('User data:', userData);

    return new Response(
      JSON.stringify({
        accessToken: longLivedTokenData.access_token,
        userId: userData.id,
        username: userData.username
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Instagram auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})