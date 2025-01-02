import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkExistingAccount } from "@/utils/socialAccounts";
import { showFacebookError, showFacebookSuccess } from "./FacebookToasts";
import { FacebookAuthHandler } from "./FacebookAuthHandler";

export const FacebookPageManager = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookAuth = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Initialize Facebook SDK and get access token using FacebookAuthHandler
      const authHandler = new FacebookAuthHandler();
      const accessToken = await authHandler.handleFacebookAuth();

      // Fetch pages
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const data = await response.json();
      
      if (data.error) {
        console.error("Facebook API Error:", data.error);
        throw new Error(data.error.message);
      }

      // Save pages to database
      let addedPages = 0;
      let duplicatePages = 0;

      for (const page of data.data) {
        const isExisting = await checkExistingAccount('facebook', page.id, 'page_id');
        if (isExisting) {
          duplicatePages++;
          continue;
        }

        const { error: insertError } = await supabase
          .from('social_accounts')
          .insert({
            user_id: user.id,
            platform: 'facebook',
            account_name: page.name,
            access_token: page.access_token,
            page_id: page.id,
            page_access_token: page.access_token,
            token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
          });

        if (insertError) {
          console.error("Error saving account:", insertError);
          throw insertError;
        }
        
        addedPages++;
      }

      if (addedPages > 0) {
        showFacebookSuccess(
          "Facebook pages connected successfully",
          `Added ${addedPages} new pages${duplicatePages > 0 ? ` (${duplicatePages} already connected)` : ''}`
        );
      } else if (duplicatePages > 0) {
        showFacebookError(
          "No new pages added",
          `All ${duplicatePages} pages were already connected`
        );
      } else {
        showFacebookError(
          "No pages found",
          "Make sure you have admin access to at least one Facebook page"
        );
      }

    } catch (error: any) {
      console.error('Facebook auth error:', error);
      showFacebookError(
        "Failed to connect Facebook pages",
        error.message || 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFacebookAuth}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <Facebook className="h-5 w-5" />
      )}
      {isLoading ? 'Connecting...' : 'Connect Facebook Pages'}
    </Button>
  );
};