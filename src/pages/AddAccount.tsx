import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AccountsHeader } from "@/components/social-accounts/AccountsHeader";
import { ConnectAccountDialog } from "@/components/social-accounts/ConnectAccountDialog";
import { AccountsList } from "@/components/social-accounts/AccountsList";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/useUser";

type SocialAccount = {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
};

const AddAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useUser();

  const { data: accounts = { instagramAccounts: [], linkedinAccounts: [] }, refetch: refetchAccounts, isLoading } = useQuery({
    queryKey: ['social-accounts', userId],
    queryFn: async () => {
      console.log('Starting to fetch accounts...');
      console.log('Current user ID from useUser hook:', userId);
      
      if (!userId) {
        console.log('No authenticated user found');
        return { instagramAccounts: [], linkedinAccounts: [] };
      }

      // Fetch Instagram accounts
      const { data: instaData, error: instaError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', 'instagram');

      if (instaError) {
        console.error("Error fetching Instagram accounts:", instaError);
        toast.error("Failed to fetch Instagram accounts");
        return { instagramAccounts: [], linkedinAccounts: [] };
      }

      // Fetch LinkedIn accounts
      const { data: linkedinData, error: linkedinError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', 'linkedin');

      if (linkedinError) {
        console.error("Error fetching LinkedIn accounts:", linkedinError);
        toast.error("Failed to fetch LinkedIn accounts");
        return { instagramAccounts: [], linkedinAccounts: [] };
      }

      console.log('Instagram accounts raw data:', instaData);
      console.log('LinkedIn accounts raw data:', linkedinData);

      // Convert instagram accounts to the expected format
      const instagramAccounts: SocialAccount[] = (instaData || []).map(account => ({
        id: account.id,
        platform: 'instagram',
        account_name: account.account_name,
        avatar_url: account.avatar_url
      }));

      // Convert linkedin accounts to the expected format
      const linkedinAccounts: SocialAccount[] = (linkedinData || []).map(account => ({
        id: account.id,
        platform: 'linkedin',
        account_name: account.account_name,
        avatar_url: account.avatar_url
      }));

      return {
        instagramAccounts,
        linkedinAccounts
      };
    },
    enabled: !!userId,
    initialData: { instagramAccounts: [], linkedinAccounts: [] }
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
      
      const { error: socialError } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (socialError) {
        throw socialError;
      }
      
      toast.success("Account disconnected successfully");
      await refetchAccounts();
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast.error("Failed to disconnect account");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AccountsHeader onOpenDialog={() => setIsDialogOpen(true)} />
          <ConnectAccountDialog onSuccess={handleSuccess} />
        </Dialog>

        {/* Account Summary Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Connected Accounts Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Accounts</p>
              <p className="text-2xl font-bold">
                {accounts.instagramAccounts.length + accounts.linkedinAccounts.length}
              </p>
            </div>
            <div className="p-4 bg-[#E4405F]/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Instagram Accounts</p>
              <p className="text-2xl font-bold">{accounts.instagramAccounts.length}</p>
              {accounts.instagramAccounts.length > 0 && (
                <ScrollArea className="h-20 mt-2">
                  <div className="space-y-1">
                    {accounts.instagramAccounts.map((account) => (
                      <p key={account.id} className="text-sm text-muted-foreground">
                        {account.account_name}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            <div className="p-4 bg-[#0A66C2]/10 rounded-lg">
              <p className="text-sm text-muted-foreground">LinkedIn Accounts</p>
              <p className="text-2xl font-bold">{accounts.linkedinAccounts.length}</p>
              {accounts.linkedinAccounts.length > 0 && (
                <ScrollArea className="h-20 mt-2">
                  <div className="space-y-1">
                    {accounts.linkedinAccounts.map((account) => (
                      <p key={account.id} className="text-sm text-muted-foreground">
                        {account.account_name}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading accounts...</p>
          </div>
        ) : (
          <AccountsList 
            instagramAccounts={accounts.instagramAccounts}
            linkedinAccounts={accounts.linkedinAccounts}
            onDisconnect={handleDisconnect}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;