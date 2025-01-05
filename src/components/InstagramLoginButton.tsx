import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InstagramLoginButtonProps {
  appId: string;
  onSuccess: (response: { accessToken: string; userId: string }) => void;
  onError: (error: string) => void;
}

// Define Facebook SDK response types
interface FacebookAuthResponse {
  authResponse: {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
    graphDomain: string;
    data_access_expiration_time: number;
  };
  status: string;
}

interface InstagramBusinessAccount {
  id: string;
  username: string;
}

interface FacebookPagesResponse {
  data: Array<{
    instagram_business_account?: InstagramBusinessAccount;
  }>;
}

const InstagramLoginButton: React.FC<InstagramLoginButtonProps> = ({
  appId,
  onSuccess,
  onError
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadFacebookSDK = () => {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        setIsSDKLoaded(true);
      };

      (function(d, s, id) {
        let js: HTMLScriptElement;
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();

    return () => {
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [appId]);

  const handleInstagramLogin = async () => {
    if (!isSDKLoaded) {
      onError('SDK not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await new Promise<FacebookAuthResponse>((resolve) => {
        window.FB.login((response) => {
          resolve(response);
        }, {
          scope: 'instagram_basic,instagram_content_publish,pages_show_list',
          auth_type: 'rerequest'
        });
      });

      if (response.status === 'connected') {
        // Get Instagram account info
        const instagramAccountResponse = await new Promise<FacebookPagesResponse>((resolve) => {
          window.FB.api(
            '/me/accounts',
            'GET',
            { fields: 'instagram_business_account{id,username}' },
            (response) => resolve(response)
          );
        });

        if (instagramAccountResponse.data?.[0]?.instagram_business_account) {
          const instagramAccount = instagramAccountResponse.data[0].instagram_business_account;
          
          onSuccess({
            accessToken: response.authResponse.accessToken,
            userId: instagramAccount.id
          });
        } else {
          onError('No Instagram Business Account found');
        }
      } else {
        onError('Instagram login failed or was cancelled');
      }
    } catch (error) {
      console.error('Instagram login error:', error);
      onError('Failed to connect Instagram account');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleInstagramLogin}
      disabled={!isSDKLoaded || isProcessing}
      className={`
        flex items-center justify-center gap-2 
        px-4 py-2 rounded
        ${isProcessing ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'}
        text-white font-medium
        transition-colors
        w-full max-w-sm
      `}
    >
      <Instagram className="w-5 h-5" />
      {isProcessing ? 'Processing...' : 'Continue with Instagram'}
    </button>
  );
};

export default InstagramLoginButton;