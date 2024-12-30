import { supabase } from "@/integrations/supabase/client";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import { showFacebookError, showFacebookSuccess } from "./FacebookToasts";
import { FacebookPageManager } from "./FacebookPageManager";

interface FacebookHandlerProps {
  onSuccess: () => void;
}

export const FacebookHandler = ({ onSuccess }: FacebookHandlerProps) => {
  const handleFacebookSuccess = async ({ accessToken }: { accessToken: string; userId: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showFacebookError(
          "Authentication required",
          "Please sign in to connect your Facebook account"
        );
        return;
      }

      // Fetch Facebook Pages
      const pagesData = await FacebookPageManager.fetchPages(accessToken);

      if (!pagesData.data || pagesData.data.length === 0) {
        showFacebookError(
          "No Facebook pages found",
          "Please create a Facebook page before connecting"
        );
        return;
      }

      // Save pages to database
      const { addedPages, duplicatePages } = await FacebookPageManager.savePagesToDatabase(
        pagesData.data,
        session.user.id,
        (added, duplicates) => {
          console.log(`Progress: Added ${added} pages, ${duplicates} duplicates`);
        }
      );

      if (addedPages > 0) {
        showFacebookSuccess(
          "Facebook pages connected",
          `Successfully connected ${addedPages} page${addedPages > 1 ? 's' : ''}`
        );
        onSuccess();
      }

      if (duplicatePages > 0) {
        showFacebookError(
          "Duplicate pages detected",
          `${duplicatePages} page${duplicatePages > 1 ? 's were' : ' was'} already connected`
        );
      }

      if (addedPages === 0 && duplicatePages === pagesData.data.length) {
        showFacebookError(
          "No new pages connected",
          "All selected pages are already connected"
        );
      }
    } catch (error: any) {
      console.error("Error processing Facebook connection:", error);
      showFacebookError(
        "Connection failed",
        error.message || "Failed to connect Facebook account. Please try again."
      );
    }
  };

  const handleFacebookError = (error: string) => {
    showFacebookError("Facebook login failed", error);
  };

  return (
    <FacebookLoginButton
      appId={import.meta.env.VITE_FACEBOOK_APP_ID}
      onSuccess={handleFacebookSuccess}
      onError={handleFacebookError}
    />
  );
};