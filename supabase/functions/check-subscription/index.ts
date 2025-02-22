import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    const email = user?.email

    if (!email) {
      return new Response(
        JSON.stringify({ subscribed: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ subscribed: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Check for any active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    })

    const subscription = subscriptions.data[0]
    let plan = null

    if (subscription) {
      const priceId = subscription.items.data[0].price.id
      if (priceId === 'price_1QZzd02NqvafcWuBTl8NBgsT') {
        plan = 'basic'
      } else if (priceId === 'price_1QZzdJ2NqvafcWuBZS6YpZbh') {
        plan = 'premium'
      }
    }

    return new Response(
      JSON.stringify({ 
        subscribed: subscriptions.data.length > 0,
        plan: plan,
        subscription: subscription ? {
          status: subscription.status,
          current_period_end: subscription.current_period_end,
        } : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error checking subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Changed from 500 to 200 to avoid CORS issues
      }
    )
  }
})