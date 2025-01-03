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

    // Get profile data using the /v2/me endpoint with r_liteprofile scope
    console.log('Fetching profile data...');
    const profileResponse = await fetch(
      'https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401',
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

    // Get email address using the /v2/emailAddress endpoint
    console.log('Fetching email address...');
    const emailResponse = await fetch(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401',
        },
      }
    );

    if (!emailResponse.ok) {
      console.warn('Failed to fetch email address:', await emailResponse.text());
      // Continue without email, it's not critical
    } else {
      const emailData = await emailResponse.json();
      console.log('Received email data:', emailData);
      if (emailData.elements?.[0]?.['handle~']?.emailAddress) {
        profileData.emailAddress = emailData.elements[0]['handle~'].emailAddress;
      }
    }

    return new Response(
      JSON.stringify({
        accessToken: tokenData.access_token,
        profileData: {
          id: profileData.id,
          localizedFirstName: profileData.localizedFirstName || '',
          localizedLastName: profileData.localizedLastName || '',
          emailAddress: profileData.emailAddress || null
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