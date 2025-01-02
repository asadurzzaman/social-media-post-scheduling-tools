import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import { AccountsHeader } from "@/components/social-accounts/AccountsHeader";
import { ConnectAccountDialog } from "@/components/social-accounts/ConnectAccountDialog";
import { AccountsList } from "@/components/social-accounts/AccountsList";
import { Tables } from "@/integrations/supabase/types";

type SocialAccount = Tables<"social_accounts">;

const AddAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: socialAccounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async () => {
      console.log('Starting to fetch social accounts...');
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*');
      
      if (error) {
        console.error("Error fetching social accounts:", error);
        toast.error("Failed to fetch social accounts");
        throw error;
      }
      
      console.log('Raw response from Supabase:', data);
      console.log('Number of accounts fetched:', data?.length || 0);
      
      if (data) {
        data.forEach((account, index) => {
          console.log(`Account ${index + 1}:`, {
            id: account.id,
            platform: account.platform,
            accountName: account.account_name,
            avatarUrl: account.avatar_url
          });
        });
      }
      
      return (data as SocialAccount[]) || [];
    },
    initialData: [] as SocialAccount[],
  });

  const handleSuccess = async () => {
    try {
      await refetchAccounts();
      setIsDialogOpen(false);
      toast.success("Account connected successfully!");
    } catch (error) {
      console.error("Error refreshing accounts:", error);
      toast.error("Failed to refresh accounts list");
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      console.log('Attempting to disconnect account:', accountId);
      
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

  // Ensure we're working with an array and filter accounts by platform
  const instagramAccounts = Array.isArray(socialAccounts) 
    ? socialAccounts.filter(account => account.platform === 'instagram')
    : [];

  const facebookAccounts = Array.isArray(socialAccounts)
    ? socialAccounts.filter(account => account.platform === 'facebook')
    : [];

  console.log('Filtered Facebook accounts:', facebookAccounts);
  console.log('Filtered Instagram accounts:', instagramAccounts);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AccountsHeader onOpenDialog={() => setIsDialogOpen(true)} />
          <ConnectAccountDialog onSuccess={handleSuccess} />
        </Dialog>
        <AccountsList 
          instagramAccounts={instagramAccounts}
          facebookAccounts={facebookAccounts}
          onDisconnect={handleDisconnect}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;