import React, { useEffect, useState } from 'react';
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [needsReconnect, setNeedsReconnect] = useState(false);

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
        checkLoginStatus();
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

    // Check for accounts that need reconnection
    const checkReconnectStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accounts } = await supabase
        .from('social_accounts')
        .select('requires_reconnect, token_expires_at')
        .eq('platform', 'facebook')
        .eq('user_id', user.id)
        .single();

      if (accounts?.requires_reconnect || 
          (accounts?.token_expires_at && new Date(accounts.token_expires_at) <= new Date())) {
        setNeedsReconnect(true);
        toast.error('Your Facebook account needs to be reconnected');
      }
    };

    checkReconnectStatus();

    return () => {
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }
      delete window.FB;
      delete window.fbAsyncInit;
    };
  }, [appId]);

  const checkLoginStatus = async () => {
    if (!window.FB) return;

    try {
      const response = await new Promise<FacebookLoginStatusResponse>((resolve) => {
        window.FB.getLoginStatus(resolve);
      });

      if (response.status === 'connected') {
        const { data: socialAccount } = await supabase
          .from('social_accounts')
          .select('token_expires_at, requires_reconnect')
          .eq('platform', 'facebook')
          .single();

        const tokenExpired = socialAccount?.token_expires_at && 
                           new Date(socialAccount.token_expires_at) <= new Date();

        if (socialAccount?.requires_reconnect || tokenExpired) {
          console.log('Token expired or reconnection needed, requesting new login');
          setNeedsReconnect(true);
          await handleFacebookLogin();
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setNeedsReconnect(true);
    }
  };

  const fetchProfilePicture = async (userId: string, accessToken: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${userId}/picture?type=large&redirect=false&access_token=${accessToken}`
      );
      const data = await response.json();
      return data.data?.url || null;
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return null;
    }
  };

  const verifyPageAccess = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('Error verifying page access:', data.error);
        return false;
      }

      return data.data && data.data.length > 0;
    } catch (error) {
      console.error('Error checking page access:', error);
      return false;
    }
  };

  const updateTokenInDatabase = async (accessToken: string, expiresIn: number, avatarUrl: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const hasPageAccess = await verifyPageAccess(accessToken);
      if (!hasPageAccess) {
        throw new Error('No Facebook pages found or insufficient permissions');
      }

      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);

      const { error } = await supabase
        .from('social_accounts')
        .update({
          access_token: accessToken,
          token_expires_at: expirationDate.toISOString(),
          user_id: user.id,
          avatar_url: avatarUrl,
          requires_reconnect: false,
          last_error: null
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
      console.log('Initiating Facebook login with extended permissions...');
      const loginResponse: FacebookLoginStatusResponse = await new Promise((resolve) => {
        window.FB.login((response: FacebookLoginStatusResponse) => {
          console.log('Login response:', response);
          resolve(response);
        }, {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata',
          return_scopes: true,
          auth_type: 'rerequest'
        });
      });

      if (loginResponse.status === 'connected' && loginResponse.authResponse) {
        console.log('Login successful, verifying page access...');
        
        const profilePicUrl = await fetchProfilePicture(
          loginResponse.authResponse.userID,
          loginResponse.authResponse.accessToken
        );
        
        try {
          await updateTokenInDatabase(
            loginResponse.authResponse.accessToken,
            loginResponse.authResponse.expiresIn,
            profilePicUrl
          );
          
          setNeedsReconnect(false);
          onSuccess({
            accessToken: loginResponse.authResponse.accessToken,
            userId: loginResponse.authResponse.userID
          });
          
          toast.success('Successfully connected to Facebook');
        } catch (error: any) {
          if (error.message.includes('No Facebook pages found')) {
            toast.error('Please make sure you have admin access to at least one Facebook page');
          }
          throw error;
        }
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
        ${isProcessing ? 'bg-gray-400' : needsReconnect ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
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
      {isProcessing ? 'Processing...' : needsReconnect ? 'Reconnect Facebook' : 'Continue with Facebook'}
    </button>
  );
};

export default FacebookLoginButton;