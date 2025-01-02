import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define FB SDK types
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const FacebookAuthHandler = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleFacebookAuth = async () => {
    try {
      setIsConnecting(true);

      // Initialize Facebook SDK
      await initFacebookSDK();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Trigger Facebook login
      const response: any = await new Promise((resolve, reject) => {
        window.FB.login((response: any) => {
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

      const { accessToken } = response.authResponse;

      // Save account to database
      const { error: dbError } = await supabase
        .from('social_accounts')
        .insert({
          platform: 'facebook',
          account_name: 'Facebook Page',
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
          user_id: user.id
        });

      if (dbError) {
        throw dbError;
      }

      toast.success('Facebook account connected successfully');
    } catch (error: any) {
      console.error('Facebook auth error:', error);
      toast.error(error.message || 'Failed to connect Facebook account');
    } finally {
      setIsConnecting(false);
    }
  };

  const initFacebookSDK = (): Promise<void> => {
    return new Promise((resolve) => {
      // Load the Facebook SDK if it's not already loaded
      if (typeof window.FB !== 'undefined') {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
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

  return (
    <Button 
      onClick={handleFacebookAuth}
      disabled={isConnecting}
      className="w-full flex items-center justify-center gap-2"
    >
      {isConnecting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <Facebook className="h-5 w-5" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect Facebook'}
    </Button>
  );
};