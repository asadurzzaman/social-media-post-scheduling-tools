import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId } = await req.json();
    
    if (!priceId || ![
      'price_1QZzd02NqvafcWuBTl8NBgsT',
      'price_1QZzdJ2NqvafcWuBZS6YpZbh'
    ].includes(priceId)) {
      throw new Error('Invalid price ID');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Generate a unique token for auto-login
    const autoLoginToken = crypto.randomUUID();
    
    // Store the token in Supabase with an expiration
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: tokenError } = await supabase
      .from('subscription_tokens')
      .insert([
        {
          token: autoLoginToken,
          price_id: priceId,
          expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes expiration
        }
      ]);

    if (tokenError) throw tokenError;

    console.log('Creating subscription session...');
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/auth/callback?token=${autoLoginToken}`,
      cancel_url: `${req.headers.get('origin')}/pricing?success=false`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('Subscription session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating subscription session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});