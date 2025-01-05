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
      } catch (error) {
        console.error('Failed to initialize Facebook SDK:', error);
        onError('Failed to initialize Facebook SDK');
        toast.error('Failed to initialize Facebook connection');
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
      toast.error('Facebook connection not ready. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      const loginResponse = await new Promise<any>((resolve, reject) => {
        window.FB.login((response) => {
          if (response.status === 'connected' && response.authResponse) {
            resolve(response);
          } else {
            reject(new Error('Facebook login failed or was cancelled'));
          }
        }, {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
          return_scopes: true,
          auth_type: 'rerequest',
          enable_profile_selector: true
        });
      });

      if (loginResponse.authResponse) {
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
      toast.error(errorMessage);
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