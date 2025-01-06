import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import { AccountsHeader } from "@/components/social-accounts/AccountsHeader";
import { ConnectAccountDialog } from "@/components/social-accounts/ConnectAccountDialog";
import { AccountsList } from "@/components/social-accounts/AccountsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const handleFacebookSuccess = async ({ accessToken, userId }: { accessToken: string; userId: string }) => {
    try {
      // Get Facebook Pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        toast.error("Error fetching Facebook pages: " + pagesData.error.message);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No active session found");
        return;
      }

      if (pagesData.data && pagesData.data.length > 0) {
        // Insert all pages as separate accounts
        for (const page of pagesData.data) {
          const { error: insertError } = await supabase
            .from('social_accounts')
            .insert({
              user_id: session.user.id,
              platform: 'facebook',
              account_name: page.name,
              access_token: accessToken,
              page_id: page.id,
              page_access_token: page.access_token,
              token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
            });

          if (insertError) {
            console.error("Error saving account:", insertError);
            toast.error(`Failed to save Facebook page: ${page.name}`);
          }
        }

        toast.success(`Successfully connected ${pagesData.data.length} Facebook page(s)!`);
        setIsDialogOpen(false);
        refetchAccounts();
      } else {
        toast.error("No Facebook pages found. Please make sure you have a Facebook page.");
      }
    } catch (error) {
      console.error("Error processing Facebook connection:", error);
      toast.error("Failed to connect Facebook account");
    }
  };

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

  // Count accounts by platform
  const totalAccounts = socialAccounts?.length || 0;
  const instagramAccounts = socialAccounts?.filter(account => account.platform === 'instagram').length || 0;
  const linkedinAccounts = socialAccounts?.filter(account => account.platform === 'linkedin').length || 0;
  const facebookAccounts = socialAccounts?.filter(account => account.platform === 'facebook') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AccountsHeader onOpenDialog={() => setIsDialogOpen(true)} />
          <ConnectAccountDialog onSuccess={handleFacebookSuccess} />
        </Dialog>

        {/* Accounts Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total Accounts</div>
            <div className="text-3xl font-bold text-gray-900">{totalAccounts}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Instagram Accounts</div>
            <div className="text-3xl font-bold text-gray-900">{instagramAccounts}</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">LinkedIn Accounts</div>
            <div className="text-3xl font-bold text-gray-900">{linkedinAccounts}</div>
          </div>
        </div>

        {/* Connected Accounts List */}
        <Card>
          <CardContent className="p-6">
            <AccountsList 
              facebookAccounts={facebookAccounts}
              onDisconnect={handleDisconnectFacebook}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;