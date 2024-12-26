import React, { useState } from 'react';
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';
import { FacebookTokenManager } from '@/utils/facebook/FacebookTokenManager';
import { FacebookSDKLoader } from './facebook/FacebookSDKLoader';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookLoginButtonProps {
  appId: string;
  onSuccess: (response: { accessToken: string; userId: string }) => void;
  onError: (error: string) => void;
}

// Type definition for Facebook login response
interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    reauthorize_required_in?: number;
    signedRequest: string;
    userID: string;
  };
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  appId,
  onSuccess,
  onError
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
      const loginResponse = await new Promise<FacebookLoginResponse>((resolve) => {
        window.FB.login((response: FacebookLoginResponse) => {
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
        const longLivedToken = await FacebookTokenManager.getLongLivedToken(
          loginResponse.authResponse.accessToken,
          appId
        );
        
        // Update the token in the database with the long-lived token
        await FacebookTokenManager.updateTokenInDatabase(
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
    <>
      <FacebookSDKLoader appId={appId} onSDKLoaded={() => setIsSDKLoaded(true)} />
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
    </>
  );
};

export default FacebookLoginButton;