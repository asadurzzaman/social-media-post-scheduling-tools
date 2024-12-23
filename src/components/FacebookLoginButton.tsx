import React, { useEffect, useState } from 'react';
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';

// Add FB SDK types
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookLoginProps {
  appId: string;
  onSuccess: (response: { accessToken: string; userId: string }) => void;
  onError: (error: string) => void;
}

const FacebookLoginButton: React.FC<FacebookLoginProps> = ({
  appId,
  onSuccess,
  onError
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize Facebook SDK
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

      // Load the SDK
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
  }, [appId]);

  const handleFacebookLogin = async () => {
    if (!isSDKLoaded) {
      onError('Facebook SDK not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      // First check if user is already logged in
      const loginStatusResponse = await new Promise((resolve) => {
        window.FB.getLoginStatus((response: any) => resolve(response));
      });

      if (loginStatusResponse.status === 'connected') {
        onSuccess({
          accessToken: loginStatusResponse.authResponse.accessToken,
          userId: loginStatusResponse.authResponse.userID
        });
      } else {
        // User needs to log in
        const loginResponse = await new Promise((resolve) => {
          window.FB.login((response: any) => resolve(response), {
            scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
            return_scopes: true,
            auth_type: 'rerequest'
          });
        });

        if (loginResponse.status === 'connected') {
          onSuccess({
            accessToken: loginResponse.authResponse.accessToken,
            userId: loginResponse.authResponse.userID
          });
        } else {
          onError('Login failed or was cancelled');
        }
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
      {/* Facebook Icon */}
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