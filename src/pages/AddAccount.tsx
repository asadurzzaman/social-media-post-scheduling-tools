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

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

interface FacebookPagesResponse {
  data: FacebookPage[];
}

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

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      // If it's a Facebook account, logout from Facebook SDK
      const account = socialAccounts?.find(acc => acc.id === accountId);
      if (account?.platform === 'facebook' && window.FB) {
        await new Promise<void>((resolve) => {
          window.FB.logout(() => {
            console.log('Logged out from Facebook SDK');
            resolve();
          });
        });
      }

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

  const handleFacebookSuccess = async (response: { accessToken: string; userId: string }) => {
    try {
      console.log('Facebook login success:', response);
      
      // Get user's Facebook pages
      const pagesResponse = await new Promise<FacebookPagesResponse>((resolve) => {
        window.FB.api('/me/accounts', { access_token: response.accessToken }, (result: FacebookPagesResponse) => {
          resolve(result);
        });
      });

      if (!pagesResponse.data || pagesResponse.data.length === 0) {
        toast.error("No Facebook pages found. Please create a Facebook page first.");
        return;
      }

      // For each page, create or update a social account
      for (const page of pagesResponse.data) {
        const { error } = await supabase
          .from('social_accounts')
          .upsert({
            platform: 'facebook',
            account_name: page.name,
            access_token: response.accessToken,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            page_id: page.id,
            page_access_token: page.access_token,
            requires_reconnect: false,
            last_error: null
          }, {
            onConflict: 'page_id'
          });

        if (error) throw error;
      }
      
      setIsDialogOpen(false);
      await refetchAccounts();
      toast.success("Facebook account connected successfully");
    } catch (error) {
      console.error("Error connecting Facebook account:", error);
      toast.error("Failed to connect Facebook account");
    }
  };

  const handleLinkedInSuccess = async (response: { accessToken: string; userId: string }) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .insert({
          platform: 'linkedin',
          account_name: 'LinkedIn Profile',
          access_token: response.accessToken,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          linkedin_user_id: response.userId
        });

      if (error) throw error;
      
      setIsDialogOpen(false);
      await refetchAccounts();
      toast.success("LinkedIn account connected successfully");
    } catch (error) {
      console.error("Error connecting LinkedIn account:", error);
      toast.error("Failed to connect LinkedIn account");
    }
  };

  const handleInstagramSuccess = async (response: { accessToken: string; userId: string }) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .insert({
          platform: 'instagram',
          account_name: 'Instagram Business Account',
          access_token: response.accessToken,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          instagram_user_id: response.userId
        });

      if (error) throw error;
      
      setIsDialogOpen(false);
      await refetchAccounts();
      toast.success("Instagram account connected successfully");
    } catch (error) {
      console.error("Error connecting Instagram account:", error);
      toast.error("Failed to connect Instagram account");
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
              linkedinAccounts={linkedinAccounts}
              instagramAccounts={instagramAccounts}
              onDisconnect={handleDisconnectAccount}
            />
          </div>
          <ConnectAccountDialog 
            onSuccess={handleFacebookSuccess}
            onLinkedInSuccess={handleLinkedInSuccess}
            onInstagramSuccess={handleInstagramSuccess}
          />
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;