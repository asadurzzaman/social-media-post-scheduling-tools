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
        console.log('Facebook SDK initialized and ready');
      } catch (error) {
        console.error('Failed to initialize Facebook SDK:', error);
        setIsSDKLoaded(false);
        onError('Failed to initialize Facebook SDK');
        toast.error('Failed to initialize Facebook connection. Please refresh and try again.');
      }
    };

    initializeSDK();

    return () => {
      FacebookSDK.cleanup(appId);
    };
  }, [appId, onError]);

  const handleLogin = async () => {
    if (!isSDKLoaded) {
      console.error('Facebook SDK not loaded');
      onError('Facebook SDK not loaded yet');
      toast.error('Facebook connection not ready. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Initiating Facebook login...');
      const loginResponse = await new Promise<any>((resolve, reject) => {
        window.FB.login((response) => {
          console.log('Facebook login response:', response);
          if (response.status === 'connected' && response.authResponse) {
            resolve(response);
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

      if (loginResponse.authResponse) {
        console.log('Facebook login successful');
        onSuccess({
          accessToken: loginResponse.authResponse.accessToken,
          userId: loginResponse.authResponse.userID
        });
        toast.success('Successfully connected to Facebook');
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