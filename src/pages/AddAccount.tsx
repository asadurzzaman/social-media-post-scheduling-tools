import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import { AccountsHeader } from "@/components/social-accounts/AccountsHeader";
import { ConnectAccountDialog } from "@/components/social-accounts/ConnectAccountDialog";
import { AccountsList } from "@/components/social-accounts/AccountsList";

const AddAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: socialAccounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async () => {
      const { data: instagramAccounts, error: instagramError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('platform', 'instagram');
      
      if (instagramError) throw instagramError;

      const { data: facebookPages, error: facebookError } = await supabase
        .from('facebook_pages')
        .select('*');
      
      if (facebookError) throw facebookError;

      // Transform Facebook pages to match social accounts structure
      const facebookAccounts = facebookPages.map(page => ({
        id: page.id,
        platform: 'facebook',
        account_name: page.page_name,
        page_id: page.page_id
      }));

      return {
        instagram: instagramAccounts || [],
        facebook: facebookAccounts || []
      };
    },
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
      // Try to delete from both tables since we don't know which one it belongs to
      await Promise.all([
        supabase.from('social_accounts').delete().eq('id', accountId),
        supabase.from('facebook_pages').delete().eq('id', accountId)
      ]);
      
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
          instagramAccounts={socialAccounts?.instagram || []}
          facebookAccounts={socialAccounts?.facebook || []}
          onDisconnect={handleDisconnect}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;