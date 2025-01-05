import { useState, useEffect } from 'react';
import { FacebookSDK } from '@/utils/facebook/FacebookSDK';
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';

interface FacebookLoginResponse {
  accessToken: string;
  userId: string;
}

interface UseFacebookLoginProps {
  appId: string;
  onSuccess: (response: FacebookLoginResponse) => void;
  onError: (error: string) => void;
}

export const useFacebookLogin = ({ appId, onSuccess, onError }: UseFacebookLoginProps) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        await FacebookSDK.initialize({
          appId,
          version: 'v18.0'
        });
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Facebook SDK:', error);
        onError('Failed to initialize Facebook SDK');
      }
    };

    initializeSDK();

    return () => {
      FacebookSDK.cleanup(appId);
    };
  }, [appId, onError]);

  const handleLogin = async () => {
    if (!isSDKLoaded) {
      onError('Facebook SDK not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      const loginResponse = await new Promise<any>((resolve) => {
        window.FB.login((response) => {
          resolve(response);
        }, {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
          return_scopes: true,
          auth_type: 'rerequest',
          enable_profile_selector: true
        });
      });

      if (loginResponse.status === 'connected' && loginResponse.authResponse) {
        onSuccess({
          accessToken: loginResponse.authResponse.accessToken,
          userId: loginResponse.authResponse.userID
        });
      } else {
        onError('Login failed or was cancelled');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      await FacebookErrorHandler.handleError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isSDKLoaded,
    isProcessing,
    handleLogin
  };
};