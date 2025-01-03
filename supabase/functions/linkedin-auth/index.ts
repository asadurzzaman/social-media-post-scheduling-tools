import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, redirectUri } = await req.json();
    console.log('Received auth code:', code);
    console.log('Redirect URI:', redirectUri);

    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('LinkedIn credentials not configured');
    }

    // Exchange code for access token
    console.log('Exchanging code for access token...');
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Received token data:', tokenData);

    if (!tokenData.access_token) {
      throw new Error('No access token received');
    }

    // Get basic profile data using the /me endpoint instead of userinfo
    console.log('Fetching profile data...');
    const profileResponse = await fetch(
      'https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch failed:', errorText);
      throw new Error(`Failed to get profile data: ${errorText}`);
    }

    const profileData = await profileResponse.json();
    console.log('Received profile data:', profileData);

    return new Response(
      JSON.stringify({
        accessToken: tokenData.access_token,
        profileData: {
          id: profileData.id,
          localizedFirstName: profileData.localizedFirstName || '',
          localizedLastName: profileData.localizedLastName || ''
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});