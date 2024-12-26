import React, { useEffect, useState } from 'react';
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
  graphDomain: string;
  data_access_expiration_time: number;
}

interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: FacebookAuthResponse | null;
}

interface FacebookLoginButtonProps {
  appId: string;
  onSuccess: (response: { accessToken: string; userId: string }) => void;
  onError: (error: string) => void;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  appId,
  onSuccess,
  onError
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadFacebookSDK = () => {
      console.log('Starting Facebook SDK initialization...');
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        
        console.log('Facebook SDK initialized successfully');
        setIsSDKLoaded(true);
      };

      // Remove existing Facebook SDK if present
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }

      // Clear any existing FB cookies
      document.cookie = 'fblo_' + appId + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

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
      delete window.FB;
      delete window.fbAsyncInit;
    };
  }, [appId]);

  const getLongLivedToken = async (shortLivedToken: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${appId}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `fb_exchange_token=${shortLivedToken}`
      );
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.access_token;
    } catch (error) {
      console.error('Error getting long-lived token:', error);
      throw error;
    }
  };

  const updateTokenInDatabase = async (accessToken: string, expiresIn: number) => {
    try {
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);

      const { error } = await supabase
        .from('social_accounts')
        .update({
          access_token: accessToken,
          token_expires_at: expirationDate.toISOString()
        })
        .eq('platform', 'facebook');

      if (error) {
        console.error('Error updating token in database:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update token in database:', error);
      throw error;
    }
  };

  const handleFacebookLogin = async () => {
    console.log('Starting Facebook login process...');
    if (!isSDKLoaded) {
      console.error('Facebook SDK not loaded yet');
      onError('Facebook SDK not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      // Force a new login attempt
      console.log('Initiating Facebook login...');
      const loginResponse: FacebookLoginStatusResponse = await new Promise((resolve) => {
        window.FB.login((response: FacebookLoginStatusResponse) => {
          console.log('Login response:', response);
          resolve(response);
        }, {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
          return_scopes: true,
          auth_type: 'rerequest'
        });
      });

      if (loginResponse.status === 'connected' && loginResponse.authResponse) {
        console.log('Login successful, getting long-lived token');
        
        // Get a long-lived token
        const longLivedToken = await getLongLivedToken(loginResponse.authResponse.accessToken);
        
        // Update the token in the database with the long-lived token
        await updateTokenInDatabase(
          longLivedToken,
          loginResponse.authResponse.expiresIn * 60 * 24 // Convert to days
        );
        
        onSuccess({
          accessToken: longLivedToken,
          userId: loginResponse.authResponse.userID
        });
      } else {
        console.error('Login failed or was cancelled');
        onError('Login failed or was cancelled');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      try {
        await FacebookErrorHandler.handleError(error);
      } catch (handledError: any) {
        onError(handledError.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={!isSDKLoaded || isProcessing}
      className={`
        flex items-center justify-center gap-2 
        px-4 py-2 rounded
        ${isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
        text-white font-medium
        transition-colors
        w-full max-w-sm
      `}
    >
      <svg
        className="w-5 h-5 fill-current"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      {isProcessing ? 'Processing...' : 'Continue with Facebook'}
    </button>
  );
};

export default FacebookLoginButton;