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
        toast.error("Failed to fetch Facebook pages", {
          description: pagesData.error.message
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required", {
          description: "Please sign in to connect your Facebook account"
        });
        return;
      }

      if (!pagesData.data || pagesData.data.length === 0) {
        toast.error("No Facebook pages found", {
          description: "Please create a Facebook page before connecting"
        });
        return;
      }

      let addedPages = 0;
      let duplicatePages = 0;

      // Insert all pages as separate accounts
      for (const page of pagesData.data) {
        // Check if this page is already connected
        const isExisting = await checkExistingAccount('facebook', page.id, 'page_id');
        if (isExisting) {
          duplicatePages++;
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
          toast.error(`Failed to save page "${page.name}"`, {
            description: insertError.message
          });
          continue;
        }
        addedPages++;
      }

      if (addedPages > 0) {
        toast.success("Facebook pages connected", {
          description: `Successfully connected ${addedPages} page${addedPages > 1 ? 's' : ''}`
        });
        onSuccess();
      } 
      
      if (duplicatePages > 0) {
        toast.error("Duplicate pages detected", {
          description: `${duplicatePages} page${duplicatePages > 1 ? 's were' : ' was'} already connected`
        });
      }

      if (addedPages === 0 && duplicatePages === pagesData.data.length) {
        toast.error("No new pages connected", {
          description: "All selected pages are already connected"
        });
      }
    } catch (error) {
      console.error("Error processing Facebook connection:", error);
      toast.error("Connection failed", {
        description: "Failed to connect Facebook account. Please try again."
      });
    }
  };

  const handleFacebookError = (error: string) => {
    toast.error("Facebook login failed", {
      description: error
    });
  };

  return (
    <FacebookLoginButton
      appId={import.meta.env.VITE_FACEBOOK_APP_ID}
      onSuccess={handleFacebookSuccess}
      onError={handleFacebookError}
    />
  );
};