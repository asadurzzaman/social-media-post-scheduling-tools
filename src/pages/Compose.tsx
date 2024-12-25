import { DashboardLayout } from "@/components/DashboardLayout";
import { IdeaManager } from "@/components/ideas/IdeaManager";
import { PricingSection } from "@/components/subscription/PricingSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Compose = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return data;
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create Idea</h2>
          </div>
        </div>

        {subscription?.subscribed ? (
          <IdeaManager />
        ) : (
          <PricingSection />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Compose;