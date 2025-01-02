import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define FB SDK types
declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (callback: (response: {
        authResponse?: {
          accessToken: string;
          userID: string;
        };
        status?: string;
      }) => void, params: { scope: string; return_scopes: boolean }) => void;
      api: (
        path: string,
        method: string,
        params: any,
        callback: (response: any) => void
      ) => void;
    };
    fbAsyncInit: () => void;
  }
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export const FacebookPageManager = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  const initFacebookSDK = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window.FB !== 'undefined') {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });
        resolve();
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    });
  };

  const handleFacebookPages = async (userAccessToken: string): Promise<FacebookPage[]> => {
    return new Promise((resolve, reject) => {
      window.FB.api(
        '/me/accounts',
        'GET',
        { access_token: userAccessToken },
        async (response) => {
          if (response.error) {
            reject(new Error(response.error.message));
            return;
          }
          resolve(response.data);
        }
      );
    });
  };

  const savePagesToDatabase = async (
    pages: FacebookPage[],
    userId: string
  ): Promise<{ added: number; duplicates: number }> => {
    let added = 0;
    let duplicates = 0;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user found');

    for (const page of pages) {
      // Check if page already exists
      const { data: existingAccounts } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('platform', 'facebook')
        .eq('account_name', page.name);

      if (existingAccounts && existingAccounts.length > 0) {
        duplicates++;
        continue;
      }

      // Save new page
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          platform: 'facebook',
          account_name: page.name,
          access_token: page.access_token,
          user_id: user.id,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        });

      if (insertError) {
        console.error('Error saving page:', insertError);
        throw insertError;
      }

      added++;
    }

    return { added, duplicates };
  };

  const handleFacebookAuth = async () => {
    try {
      setIsConnecting(true);
      setIsLoadingPages(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Initialize Facebook SDK
      await initFacebookSDK();

      // Trigger Facebook login
      const response = await new Promise<{ authResponse?: { accessToken: string } }>((resolve, reject) => {
        window.FB.login((response) => {
          if (response.authResponse) {
            resolve(response);
          } else {
            reject(new Error('User cancelled login or did not fully authorize'));
          }
        }, {
          scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata',
          return_scopes: true
        });
      });

      const { accessToken } = response.authResponse!;

      // Fetch Facebook pages
      const pages = await handleFacebookPages(accessToken);
      
      // Save pages to database
      const { added, duplicates } = await savePagesToDatabase(pages, user.id);

      if (added > 0) {
        toast.success(`Successfully connected ${added} Facebook ${added === 1 ? 'page' : 'pages'}`);
      }
      if (duplicates > 0) {
        toast.info(`${duplicates} ${duplicates === 1 ? 'page was' : 'pages were'} already connected`);
      }
      if (added === 0 && duplicates === 0) {
        toast.error('No Facebook pages were found or connected');
      }

    } catch (error: any) {
      console.error('Facebook auth error:', error);
      toast.error(error.message || 'Failed to connect Facebook account');
    } finally {
      setIsConnecting(false);
      setIsLoadingPages(false);
    }
  };

  return (
    <Button 
      onClick={handleFacebookAuth}
      disabled={isConnecting || isLoadingPages}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
    >
      {isConnecting || isLoadingPages ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <Facebook className="h-5 w-5" />
      )}
      {isConnecting ? 'Connecting...' : 
       isLoadingPages ? 'Loading pages...' : 
       'Connect Facebook'}
    </Button>
  );
};