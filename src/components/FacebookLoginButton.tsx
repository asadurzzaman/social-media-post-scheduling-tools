import React, { useState } from 'react';
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';
import { supabase } from "@/integrations/supabase/client";
import { FacebookSDKLoader } from './facebook/FacebookSDKLoader';
import { updateTokenInDatabase } from './facebook/FacebookTokenManager';
import { toast } from 'sonner';

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

  const checkTokenStatus = async () => {
    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      return null;
    }

    try {
      const response = await new Promise<FacebookLoginStatusResponse>((resolve) => {
        window.FB.getLoginStatus((response: FacebookLoginStatusResponse) => {
          resolve(response);
        });
      });

      if (response.status === 'connected' && response.authResponse) {
        return response.authResponse;
      }
      return null;
    } catch (error) {
      console.error('Error checking token status:', error);
      return null;
    }
  };

  const handleFacebookLogin = async () => {
    console.log('Starting Facebook login process...');
    if (!isSDKLoaded || !window.FB) {
      console.error('Facebook SDK not loaded yet');
      onError('Facebook SDK not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      // Check for existing session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        console.error('No valid session found');
        onError('Please sign in to continue');
        return;
      }

      // Check current token status
      const existingAuth = await checkTokenStatus();
      if (existingAuth && existingAuth.data_access_expiration_time * 1000 > Date.now()) {
        console.log('Using existing valid token');
        await updateTokenInDatabase(
          existingAuth.accessToken,
          existingAuth.expiresIn
        );
        onSuccess({
          accessToken: existingAuth.accessToken,
          userId: existingAuth.userID
        });
        return;
      }

      // Force a new login attempt if token is expired or not present
      console.log('Initiating new Facebook login...');
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
        console.log('Login successful, updating token in database');
        await updateTokenInDatabase(
          loginResponse.authResponse.accessToken,
          loginResponse.authResponse.expiresIn
        );
        
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
        onError(handledError.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <FacebookSDKLoader appId={appId} onLoad={() => setIsSDKLoaded(true)} />
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