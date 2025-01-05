import { useState, useEffect } from 'react';
import { FacebookSDK } from '@/utils/facebook/FacebookSDK';
import { toast } from "sonner";

interface UseFacebookLoginProps {
  appId: string;
  onSuccess: (response: { accessToken: string; userId: string }) => void;
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
        console.log('Facebook SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Facebook SDK:', error);
        setIsSDKLoaded(false);
        onError('Failed to initialize Facebook SDK');
      }
    };

    // Clean up any existing SDK instance first
    FacebookSDK.cleanup(appId);
    
    // Initialize new SDK instance
    initializeSDK();

    return () => {
      FacebookSDK.cleanup(appId);
    };
  }, [appId, onError]);

  const handleLogin = async () => {
    if (!isSDKLoaded || !window.FB) {
      console.error('Facebook SDK not loaded');
      toast.error('Facebook connection not ready. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Initiating Facebook login...');
      const loginResponse = await new Promise<fb.AuthResponse>((resolve, reject) => {
        window.FB.login((response) => {
          console.log('Facebook login response:', response);
          if (response.status === 'connected' && response.authResponse) {
            resolve(response.authResponse);
          } else {
            reject(new Error(response.status === 'not_authorized' 
              ? 'Please authorize the application to continue'
              : 'Facebook login failed or was cancelled'));
          }
        }, {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
          return_scopes: true,
          auth_type: 'rerequest',
          enable_profile_selector: true
        });
      });

      if (loginResponse) {
        console.log('Facebook login successful');
        onSuccess({
          accessToken: loginResponse.accessToken,
          userId: loginResponse.userID
        });
      } else {
        throw new Error('No auth response received');
      }
    } catch (error: any) {
      console.error('Facebook login error:', error);
      const errorMessage = error.message || 'Failed to connect with Facebook';
      onError(errorMessage);
      toast.error('Failed to connect Facebook account. Please try again.');
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