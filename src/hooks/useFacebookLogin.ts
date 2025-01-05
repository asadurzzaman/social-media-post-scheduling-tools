import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FacebookErrorHandler } from '@/utils/facebook/FacebookErrorHandler';

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

export const useFacebookLogin = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const updateTokenInDatabase = async (accessToken: string, expiresIn: number) => {
    try {
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);

      const { error } = await supabase
        .from('social_accounts')
        .update({
          access_token: accessToken,
          token_expires_at: expirationDate.toISOString(),
          requires_reconnect: false,
          last_error: null
        })
        .eq('platform', 'facebook');

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update token in database:', error);
      throw error;
    }
  };

  const handleLogin = async (onSuccess: (response: { accessToken: string; userId: string }) => void, onError: (error: string) => void) => {
    console.log('Starting Facebook login process...');
    if (!window.FB) {
      console.error('Facebook SDK not loaded yet');
      onError('Facebook SDK not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Initiating Facebook login...');
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

  return {
    isProcessing,
    handleLogin
  };
};