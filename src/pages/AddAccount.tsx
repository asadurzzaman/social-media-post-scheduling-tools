import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AccountsHeader } from "@/components/social-accounts/AccountsHeader";
import { ConnectAccountDialog } from "@/components/social-accounts/ConnectAccountDialog";
import { AccountsList } from "@/components/social-accounts/AccountsList";
import { AccountSummary } from "@/components/social-accounts/AccountSummary";
import { useUser } from "@/hooks/useUser";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AddAccount = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId } = useUser();
  const { data: accounts = { instagramAccounts: [], linkedinAccounts: [] }, refetch: refetchAccounts, isLoading } = useSocialAccounts(userId);

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

        <AccountSummary 
          instagramAccounts={accounts.instagramAccounts}
          linkedinAccounts={accounts.linkedinAccounts}
        />

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