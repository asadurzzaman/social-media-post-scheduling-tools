import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FacebookPageManager } from './FacebookPageManager';
import { toast } from "sonner";

export const FacebookAuthHandler = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleFacebookAuth = async () => {
    try {
      setIsConnecting(true);

      // Initialize Facebook SDK
      await initFacebookSDK();

      // Trigger Facebook login
      const response = await new Promise((resolve, reject) => {
        FB.login((response) => {
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

      // Fetch pages that the user manages
      const pages = await FacebookPageManager.fetchPages(accessToken);

      if (!pages?.data?.length) {
        throw new Error('No Facebook pages found. Please create a Facebook page first.');
      }

      // Save pages to database
      const { addedPages, duplicatePages } = await FacebookPageManager.savePagesToDatabase(
        pages.data,
        auth.uid(),
        (added, duplicates) => {
          if (added > 0) {
            toast.success(`Added ${added} Facebook page(s)`);
          }
          if (duplicates > 0) {
            toast.info(`${duplicates} page(s) were already connected`);
          }
        }
      );

      if (addedPages === 0 && duplicatePages === pages.data.length) {
        toast.error('All pages are already connected');
      } else {
        toast.success('Facebook pages connected successfully');
      }
    } catch (error) {
      console.error('Facebook auth error:', error);
      toast.error(error.message || 'Failed to connect Facebook account');
    } finally {
      setIsConnecting(false);
    }
  };

  const initFacebookSDK = () => {
    return new Promise((resolve, reject) => {
      // Load the Facebook SDK if it's not already loaded
      if (typeof FB !== 'undefined') {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        FB.init({
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
        fjs.parentNode.insertBefore(js, fjs);
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