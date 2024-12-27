import { supabase } from "@/integrations/supabase/client";

export const checkExistingLinkedInAccount = async (profileId: string) => {
  const { data: existingAccounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'linkedin')
    .eq('page_id', profileId);

  return existingAccounts && existingAccounts.length > 0;
};

export const canPostToLinkedIn = async (userId: string) => {
  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'linkedin')
    .eq('user_id', userId)
    .single();

  if (error || !accounts) {
    console.error('Error checking LinkedIn account:', error);
    return false;
  }

  // Check if the token has expired
  if (accounts.token_expires_at) {
    const expiryDate = new Date(accounts.token_expires_at);
    if (expiryDate < new Date()) {
      console.log('LinkedIn token has expired');
      return false;
    }
  }

  // Check if account requires reconnection
  if (accounts.requires_reconnect) {
    console.log('LinkedIn account requires reconnection');
    return false;
  }

  return true;
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