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
        };
        status?: string;
      }) => void, params: { scope: string; return_scopes: boolean }) => void;
    };
    fbAsyncInit: () => void;
  }
}

export const handleFacebookAuth = async (): Promise<string> => {
  try {
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
    return accessToken;

  } catch (error: any) {
    console.error('Facebook auth error:', error);
    toast.error(error.message || 'Failed to connect Facebook account');
    throw error;
  }
};

const initFacebookSDK = async (): Promise<void> => {
  return new Promise((resolve) => {
    // Load the Facebook SDK if it's not already loaded
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