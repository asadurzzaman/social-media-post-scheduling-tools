import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
}

interface LinkedInProfileResponse {
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirectUri, state } = await req.json()

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: Deno.env.get('LINKEDIN_CLIENT_ID') || '',
        client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET') || '',
      }),
    })

    const tokenData: LinkedInTokenResponse = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token')
    }

    // Get user profile information
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const profileData: LinkedInProfileResponse = await profileResponse.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user ID from session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] || '')
    
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    // Store the account information
    const accountName = profileData.localizedFirstName && profileData.localizedLastName 
      ? `${profileData.localizedFirstName} ${profileData.localizedLastName}`
      : `LinkedIn Profile ${profileData.id}`

    const { error: insertError } = await supabaseClient
      .from('social_accounts')
      .insert({
        user_id: user.id,
        platform: 'linkedin',
        account_name: accountName,
        access_token: tokenData.access_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      })

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})