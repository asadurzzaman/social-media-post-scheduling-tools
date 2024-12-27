import { supabase } from "@/integrations/supabase/client";

export const checkExistingAccount = async (platform: string, identifier: string, identifierType: 'page_id' | 'account_name') => {
  const { data: existingAccounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', platform)
    .eq(identifierType, identifier);
  
  return existingAccounts && existingAccounts.length > 0;
};