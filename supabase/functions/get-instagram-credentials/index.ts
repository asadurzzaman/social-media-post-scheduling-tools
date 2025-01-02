import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const instagram_app_id = Deno.env.get('INSTAGRAM_APP_ID')
    const instagram_app_secret = Deno.env.get('INSTAGRAM_APP_SECRET')
    
    if (!instagram_app_id || !instagram_app_secret) {
      throw new Error('Instagram credentials not configured')
    }

    return new Response(
      JSON.stringify({ 
        instagram_app_id,
        instagram_app_secret 
      }),
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