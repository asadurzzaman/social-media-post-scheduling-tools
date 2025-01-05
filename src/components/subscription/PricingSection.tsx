import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "./PricingCard";

const plans = [
  {
    title: "Basic Plan",
    price: 10,
    priceId: "price_1QZzd02NqvafcWuBTl8NBgsT",
    features: [
      "Schedule up to 30 posts",
      "Basic analytics",
      "1 social media account",
      "Email support"
    ]
  },
  {
    title: "Premium Plan",
    price: 50,
    priceId: "price_1QZzdJ2NqvafcWuBZS6YpZbh",
    features: [
      "Unlimited scheduled posts",
      "Advanced analytics",
      "Up to 5 social media accounts",
      "Priority support",
      "Custom branded content"
    ]
  }
];

export function PricingSection() {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the perfect plan for your social media management needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.priceId}
            {...plan}
            isCurrentPlan={subscription?.plan === (plan.price === 10 ? 'basic' : 'premium')}
          />
        ))}
      </div>
    </div>
  );
}