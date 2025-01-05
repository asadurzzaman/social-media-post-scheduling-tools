import React, { useEffect, useState } from 'react';
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';
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

  useEffect(() => {
    const loadFacebookSDK = () => {
      console.log('Starting Facebook SDK initialization...');
      
      // Clear any existing FB instance
      delete window.FB;
      delete window.fbAsyncInit;

      window.fbAsyncInit = function() {
        try {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0',
            status: true
          });
          console.log('Facebook SDK initialized successfully');
          setIsSDKLoaded(true);
        } catch (error) {
          console.error('Facebook SDK initialization error:', error);
          onError('Failed to initialize Facebook SDK');
        }
      };

      // Remove existing Facebook SDK if present
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }

      // Clear any existing FB cookies
      document.cookie = 'fblo_' + appId + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      try {
        (function(d, s, id) {
          let js: HTMLScriptElement;
          const fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s) as HTMLScriptElement;
          js.id = id;
          js.src = "https://connect.facebook.net/en_US/sdk.js";
          js.crossOrigin = "anonymous";
          js.async = true;
          js.defer = true;
          js.onerror = () => {
            console.error('Failed to load Facebook SDK script');
            toast.error('Failed to load Facebook SDK. Please check your internet connection and try again.');
          };
          fjs.parentNode?.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      } catch (error) {
        console.error('Error loading Facebook SDK script:', error);
        onError('Failed to load Facebook SDK');
      }
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
  }, [appId, onError]);

  const handleFacebookLogin = async () => {
    console.log('Starting Facebook login process...');
    if (!isSDKLoaded) {
      console.error('Facebook SDK not loaded yet');
      onError('Facebook SDK not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      // Check if FB object exists and is properly initialized
      if (!window.FB) {
        throw new Error('Facebook SDK not properly initialized');
      }

      console.log('Initiating Facebook login...');
      const loginResponse: FacebookLoginStatusResponse = await new Promise((resolve) => {
        window.FB.login((response: FacebookLoginStatusResponse) => {
          console.log('Login response:', response);
          resolve(response);
        }, {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
          return_scopes: true,
          auth_type: 'rerequest',
          enable_profile_selector: true
        });
      });

      if (loginResponse.status === 'connected' && loginResponse.authResponse) {
        console.log('Login successful, proceeding with success callback');
        onSuccess({
          accessToken: loginResponse.authResponse.accessToken,
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
        onError(handledError.message || 'An error occurred during Facebook login');
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