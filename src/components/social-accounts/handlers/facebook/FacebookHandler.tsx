import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import { checkExistingAccount } from "@/utils/socialAccounts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FacebookHandlerProps {
  onSuccess: () => void;
}

export const FacebookHandler = ({ onSuccess }: FacebookHandlerProps) => {
  const handleFacebookSuccess = async ({ accessToken }: { accessToken: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required", {
          description: "Please sign in to connect your Facebook account"
        });
        return;
      }

      // Get Facebook Pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        console.error("Facebook API Error:", pagesData.error);
        toast.error("Failed to fetch Facebook pages");
        return;
      }

      if (!pagesData.data || pagesData.data.length === 0) {
        toast.error("No Facebook pages found");
        return;
      }

      let addedPages = 0;
      let duplicatePages = 0;

      for (const page of pagesData.data) {
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
          continue;
        }
        addedPages++;
      }

      if (addedPages > 0) {
        toast.success(`Successfully connected ${addedPages} page${addedPages > 1 ? 's' : ''}`);
        onSuccess();
      }

      if (duplicatePages > 0) {
        toast.error(`${duplicatePages} page${duplicatePages > 1 ? 's were' : ' was'} already connected`);
      }

      if (addedPages === 0 && duplicatePages === pagesData.data.length) {
        toast.error("All selected pages are already connected");
      }
    } catch (error: any) {
      console.error("Error processing Facebook connection:", error);
      toast.error("Failed to connect Facebook account");
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