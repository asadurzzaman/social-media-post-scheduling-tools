import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
}

interface AccountsData {
  instagramAccounts: SocialAccount[];
  linkedinAccounts: SocialAccount[];
}

const defaultAccounts: AccountsData = {
  instagramAccounts: [],
  linkedinAccounts: []
};

export const useSocialAccounts = (userId: string | null) => {
  return useQuery({
    queryKey: ['social-accounts', userId],
    queryFn: async () => {
      console.log('Starting to fetch accounts...');
      console.log('Current user ID:', userId);
      
      if (!userId) {
        console.log('No authenticated user found');
        return defaultAccounts;
      }

      try {
        // Fetch Instagram accounts
        const { data: instaData, error: instaError } = await supabase
          .from('social_accounts')
          .select('*')
          .eq('user_id', userId)
          .eq('platform', 'instagram');

        if (instaError) {
          console.error("Error fetching Instagram accounts:", instaError);
          toast.error("Failed to fetch Instagram accounts");
          return defaultAccounts;
        }

        // Fetch LinkedIn accounts
        const { data: linkedinData, error: linkedinError } = await supabase
          .from('social_accounts')
          .select('*')
          .eq('user_id', userId)
          .eq('platform', 'linkedin');

        if (linkedinError) {
          console.error("Error fetching LinkedIn accounts:", linkedinError);
          toast.error("Failed to fetch LinkedIn accounts");
          return defaultAccounts;
        }

        console.log('Instagram accounts raw data:', instaData);
        console.log('LinkedIn accounts raw data:', linkedinData);

        return {
          instagramAccounts: (instaData || []).map(account => ({
            id: account.id,
            platform: 'instagram',
            account_name: account.account_name,
            avatar_url: account.avatar_url
          })),
          linkedinAccounts: (linkedinData || []).map(account => ({
            id: account.id,
            platform: 'linkedin',
            account_name: account.account_name,
            avatar_url: account.avatar_url
          }))
        };
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Failed to fetch accounts");
        return defaultAccounts;
      }
    },
    enabled: !!userId,
    initialData: defaultAccounts
  });
};