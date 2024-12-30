import React, { useState } from 'react';
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';
import { useFacebookSDK } from '@/utils/facebook/useFacebookSDK';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FacebookLoginButtonProps {
  appId: string;
  onSuccess: (response: { accessToken: string; userId: string }) => void;
  onError: (error: string) => void;
  isReconnect?: boolean;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  appId,
  onSuccess,
  onError,
  isReconnect = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isSDKLoaded, initError, reinitialize } = useFacebookSDK(appId);

  const handleFacebookLogin = async () => {
    if (!window.FB) {
      toast.error('Facebook SDK not loaded');
      // Try to reinitialize the SDK
      await reinitialize();
      return;
    }

    if (initError) {
      toast.error(initError);
      onError(initError);
      return;
    }

    setIsProcessing(true);
    console.log('Starting Facebook login process...');

    try {
      const response = await new Promise<any>((resolve, reject) => {
        window.FB.login((loginResponse) => {
          if (loginResponse.status === 'connected') {
            resolve(loginResponse);
          } else {
            reject(new Error('Login failed or was cancelled'));
          }
        }, {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
          return_scopes: true,
          auth_type: 'rerequest'
        });
      });

      if (response.authResponse) {
        onSuccess({
          accessToken: response.authResponse.accessToken,
          userId: response.authResponse.userID
        });
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
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg
          className="w-5 h-5 fill-current"
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}
      {isProcessing ? 'Processing...' : isReconnect ? 'Reconnect Facebook' : 'Continue with Facebook'}
    </button>
  );
};

export default FacebookLoginButton;