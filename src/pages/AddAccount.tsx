import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { AccountsHeader } from "@/components/social-accounts/AccountsHeader";
import { ConnectAccountDialog } from "@/components/social-accounts/ConnectAccountDialog";
import { AccountsList } from "@/components/social-accounts/AccountsList";
import { Tables } from "@/integrations/supabase/types";

type FacebookPage = Tables<"facebook_pages">;
type SocialAccount = {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
};

const AddAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: accounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async () => {
      console.log('Starting to fetch accounts...');
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
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
        throw fbError;
      }
      
      console.log('Facebook pages raw data:', fbData);

      // Fetch Instagram accounts
      const { data: instaData, error: instaError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'instagram');

      if (instaError) {
        console.error("Error fetching Instagram accounts:", instaError);
        toast.error("Failed to fetch Instagram accounts");
        throw instaError;
      }

      console.log('Instagram accounts raw data:', instaData);

      // Convert facebook_pages to the format expected by AccountsList
      const facebookAccounts: SocialAccount[] = (fbData || []).map(page => ({
        id: page.id,
        platform: 'facebook',
        account_name: page.page_name,
        avatar_url: undefined
      }));

      // Convert instagram accounts to the expected format
      const instagramAccounts: SocialAccount[] = (instaData || []).map(account => ({
        id: account.id,
        platform: 'instagram',
        account_name: account.account_name,
        avatar_url: account.avatar_url
      }));

      const allAccounts = [...instagramAccounts, ...facebookAccounts];
      
      console.log('Final accounts breakdown:', {
        total: allAccounts.length,
        facebook: facebookAccounts.length,
        instagram: instagramAccounts.length
      });
      
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
        <AccountsList 
          instagramAccounts={accounts.instagramAccounts}
          facebookAccounts={accounts.facebookAccounts}
          onDisconnect={handleDisconnect}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;