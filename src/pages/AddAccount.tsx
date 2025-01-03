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

type FacebookPage = Tables<"facebook_pages">;
type SocialAccount = {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
};

const AddAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: accounts = { facebookAccounts: [], instagramAccounts: [] }, refetch: refetchAccounts, isLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async () => {
      console.log('Starting to fetch accounts...');
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return { facebookAccounts: [], instagramAccounts: [] };
      }
      console.log('Current user ID:', user.id);

      // Fetch Facebook pages
      const { data: fbData, error: fbError } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (fbError) {
        console.error("Error fetching Facebook pages:", fbError);
        toast.error("Failed to fetch Facebook pages");
        return { facebookAccounts: [], instagramAccounts: [] };
      }
      
      console.log('Facebook pages raw data:', fbData);

      // Convert facebook_pages to the format expected by AccountsList
      const facebookAccounts: SocialAccount[] = (fbData || []).map(page => ({
        id: page.id,
        platform: 'facebook',
        account_name: page.page_name,
        avatar_url: undefined
      }));

      // Fetch Instagram accounts
      const { data: instaData, error: instaError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'instagram');

      if (instaError) {
        console.error("Error fetching Instagram accounts:", instaError);
        toast.error("Failed to fetch Instagram accounts");
        return { facebookAccounts, instagramAccounts: [] };
      }

      console.log('Instagram accounts raw data:', instaData);

      // Convert instagram accounts to the expected format
      const instagramAccounts: SocialAccount[] = (instaData || []).map(account => ({
        id: account.id,
        platform: 'instagram',
        account_name: account.account_name,
        avatar_url: account.avatar_url
      }));

      return {
        facebookAccounts,
        instagramAccounts
      };
    },
    initialData: { facebookAccounts: [], instagramAccounts: [] }
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
      
      // Try to delete from social_accounts first (for Instagram)
      const { error: socialError } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (socialError) {
        // If not found in social_accounts, try facebook_pages
        const { error: fbError } = await supabase
          .from('facebook_pages')
          .delete()
          .eq('id', accountId);

        if (fbError) {
          throw fbError;
        }
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
              <p className="text-2xl font-bold">{accounts.facebookAccounts.length + accounts.instagramAccounts.length}</p>
            </div>
            <div className="p-4 bg-[#1877F2]/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Facebook Pages</p>
              <p className="text-2xl font-bold">{accounts.facebookAccounts.length}</p>
              {accounts.facebookAccounts.length > 0 && (
                <ScrollArea className="h-20 mt-2">
                  <div className="space-y-1">
                    {accounts.facebookAccounts.map((account) => (
                      <p key={account.id} className="text-sm text-muted-foreground">
                        {account.account_name}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              )}
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
          </div>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading accounts...</p>
          </div>
        ) : (
          <AccountsList 
            instagramAccounts={accounts.instagramAccounts}
            facebookAccounts={accounts.facebookAccounts}
            onDisconnect={handleDisconnect}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;