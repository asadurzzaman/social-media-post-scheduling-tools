import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import { checkExistingAccount } from "@/utils/socialAccounts";

interface FacebookHandlerProps {
  onSuccess: () => void;
}

export const FacebookHandler = ({ onSuccess }: FacebookHandlerProps) => {
  const handleFacebookSuccess = async ({ accessToken, userId }: { accessToken: string; userId: string }) => {
    try {
      // Get Facebook Pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        console.error("Facebook API Error:", pagesData.error);
        toast.error("Error fetching Facebook pages: " + pagesData.error.message);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No active session found");
        return;
      }

      if (pagesData.data && pagesData.data.length > 0) {
        let addedPages = 0;
        // Insert all pages as separate accounts
        for (const page of pagesData.data) {
          // Check if this page is already connected
          const isExisting = await checkExistingAccount('facebook', page.id, 'page_id');
          if (isExisting) {
            toast.error(`Page "${page.name}" is already connected`);
            continue;
          }

          const { error: insertError } = await supabase
            .from('social_accounts')
            .insert({
              user_id: session.user.id,
              platform: 'facebook',
              account_name: page.name,
              access_token: page.access_token,
              page_id: page.id,
              page_access_token: page.access_token,
              token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
            });

          if (insertError) {
            console.error("Error saving account:", insertError);
            toast.error(`Failed to save Facebook page: ${page.name}`);
            continue;
          }
          addedPages++;
        }

        if (addedPages > 0) {
          toast.success(`Successfully connected ${addedPages} Facebook page(s)!`);
          onSuccess();
        } else {
          toast.error("No new Facebook pages were connected");
        }
      } else {
        toast.error("No Facebook pages found. Please make sure you have a Facebook page.");
      }
    } catch (error) {
      console.error("Error processing Facebook connection:", error);
      toast.error("Failed to connect Facebook account");
    }
  };

  const handleFacebookError = (error: string) => {
    toast.error(error);
  };

  return (
    <FacebookLoginButton
      appId="1294294115054311"
      onSuccess={handleFacebookSuccess}
      onError={handleFacebookError}
    />
  );
};