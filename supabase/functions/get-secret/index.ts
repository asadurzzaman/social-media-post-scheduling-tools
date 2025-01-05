import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received request:', req.method);
    
    if (req.method !== 'POST') {
      throw new Error(`HTTP method ${req.method} is not allowed`);
    }

    const { secretName } = await req.json();
    console.log('Requested secret name:', secretName);
    
    // Only allow specific secret names
    const allowedSecrets = ['FACEBOOK_APP_ID'];
    if (!allowedSecrets.includes(secretName)) {
      throw new Error('Invalid secret name requested');
    }

    // Return the requested secret
    const secret = Deno.env.get(secretName);
    console.log('Secret found:', !!secret);
    
    if (!secret) {
      throw new Error(`Secret ${secretName} not found`);
    }

    return new Response(
      JSON.stringify({ [secretName]: secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in get-secret function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});