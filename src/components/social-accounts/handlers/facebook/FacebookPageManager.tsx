import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkExistingAccount } from "@/utils/socialAccounts";
import { showFacebookError, showFacebookSuccess } from "./FacebookToasts";
import { handleFacebookAuth } from "./FacebookAuthHandler";
import { CreateFacebookPostDialog } from "@/components/facebook/CreateFacebookPostDialog";

export const FacebookPageManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>("");

  const handleConnect = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get Facebook access token
      const accessToken = await handleFacebookAuth();
      console.log('Facebook access token obtained:', accessToken);

      // Fetch pages
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const data = await response.json();
      console.log('Facebook pages data:', data);
      
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
            access_token: accessToken,
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
    <div className="space-y-4">
      <Button 
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Facebook className="h-5 w-5" />
            <span>Connect Facebook Pages</span>
          </>
        )}
      </Button>

      <CreateFacebookPostDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        pageId={selectedPageId}
      />
    </div>
  );
};