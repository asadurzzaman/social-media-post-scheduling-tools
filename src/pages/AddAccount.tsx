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
type FacebookPage = Tables<"facebook_pages">;

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

      // First, let's check all social accounts
      const { data: allSocialAccounts, error: socialError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('All social accounts:', allSocialAccounts);

      if (socialError) {
        console.error("Error fetching social accounts:", socialError);
        toast.error("Failed to fetch social accounts");
        throw socialError;
      }

      // Now, let's check Facebook pages specifically
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
      
      console.log('Facebook pages:', fbData);

      // Convert facebook_pages to social_accounts format
      const facebookAccounts = fbData?.map(page => ({
        id: page.id,
        platform: 'facebook',
        account_name: page.page_name,
        user_id: page.user_id,
        created_at: page.connected_at || new Date().toISOString(),
        avatar_url: null,
        page_id: page.page_id,
        page_access_token: page.page_access_token
      })) || [];

      // Filter Instagram accounts from social_accounts
      const instagramAccounts = allSocialAccounts?.filter(account => 
        account.platform === 'instagram'
      ) || [];

      const allAccounts = [...instagramAccounts, ...facebookAccounts];
      
      console.log('Combined accounts:', allAccounts);
      console.log('Number of total accounts:', allAccounts.length);
      console.log('Number of Instagram accounts:', instagramAccounts.length);
      console.log('Number of Facebook accounts:', facebookAccounts.length);
      
      return allAccounts as SocialAccount[];
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

  // Filter accounts by platform
  const instagramAccounts = accounts?.filter(account => account.platform === 'instagram') || [];
  const facebookAccounts = accounts?.filter(account => account.platform === 'facebook') || [];

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