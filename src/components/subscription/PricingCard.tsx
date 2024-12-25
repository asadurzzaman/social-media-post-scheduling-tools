import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingCardProps {
  title: string;
  price: number;
  features: string[];
  priceId: string;
  isCurrentPlan?: boolean;
}

export function PricingCard({ title, price, features, priceId, isCurrentPlan }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      if (!data.url) throw new Error('No checkout URL received');

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to start subscription process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="mt-2">
            <span className="text-3xl font-bold">${price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : isLoading ? 'Loading...' : 'Subscribe'}
        </Button>
      </div>
    </Card>
  );
}