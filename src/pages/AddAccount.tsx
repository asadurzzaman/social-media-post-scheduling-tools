import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import { AccountsHeader } from "@/components/social-accounts/AccountsHeader";
import { ConnectAccountDialog } from "@/components/social-accounts/ConnectAccountDialog";
import { AccountsList } from "@/components/social-accounts/AccountsList";
import { AccountsSummary } from "@/components/social-accounts/AccountsSummary";

const AddAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: socialAccounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleDisconnectFacebook = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      
      toast.success("Account disconnected successfully");
      await refetchAccounts();
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast.error("Failed to disconnect account");
    }
  };

  const facebookAccounts = socialAccounts?.filter(account => account.platform === 'facebook') || [];
  const instagramAccounts = socialAccounts?.filter(account => account.platform === 'instagram') || [];
  const linkedinAccounts = socialAccounts?.filter(account => account.platform === 'linkedin') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AccountsHeader onOpenDialog={() => setIsDialogOpen(true)} />
          <AccountsSummary 
            totalAccounts={socialAccounts?.length || 0}
            instagramAccounts={instagramAccounts.length}
            linkedinAccounts={linkedinAccounts.length}
          />
          <div className="bg-white rounded-lg border p-6">
            <AccountsList 
              facebookAccounts={facebookAccounts}
              onDisconnect={handleDisconnectFacebook}
            />
          </div>
          <ConnectAccountDialog onSuccess={() => {
            setIsDialogOpen(false);
            refetchAccounts();
          }} />
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;