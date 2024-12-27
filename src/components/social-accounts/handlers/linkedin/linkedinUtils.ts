import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const showSuccessToast = () => {
  toast.success("LinkedIn account connected");
};

export const showErrorToast = (message: string) => {
  toast.error("LinkedIn connection failed", {
    description: message
  });
};

export const checkExistingLinkedInAccount = async (profileId: string) => {
  const { data: existingAccounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'linkedin')
    .eq('page_id', profileId);

  return existingAccounts && existingAccounts.length > 0;
};

export const saveLinkedInAccount = async (
  userId: string,
  accountName: string,
  accessToken: string,
  profileId: string,
  expiresIn: number
) => {
  const { error: insertError } = await supabase
    .from('social_accounts')
    .insert({
      user_id: userId,
      platform: 'linkedin',
      account_name: accountName,
      access_token: accessToken,
      page_id: profileId,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });

  if (insertError) throw insertError;
};