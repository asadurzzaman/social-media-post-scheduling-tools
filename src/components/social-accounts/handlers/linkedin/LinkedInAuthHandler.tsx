import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react"; 
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const LinkedInAuthHandler = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLinkedInAuth = async () => {
    try {
      setIsConnecting(true);
      console.log('Starting LinkedIn auth process...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Generate random state for CSRF protection
      const state = Math.random().toString(36).substring(7);
      console.log('Generated state:', state);
      localStorage.setItem('linkedin_auth_state', state);

      // Calculate redirect URI
      const redirectUri = `${window.location.origin}/linkedin-callback.html`;

      // Only use w_member_social scope as r_liteprofile is not authorized
      const scope = encodeURIComponent('w_member_social');
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86uror0q3ruwuf&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;

      console.log('Opening LinkedIn auth popup...');

      // Open LinkedIn auth in popup
      const width = 600;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const popup = window.open(
        linkedInAuthUrl,
        'linkedin-auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error('Failed to open popup window');
      }

      // Listen for the callback
      const handleMessage = async (event) => {
        try {
          if (event.data.type === 'linkedin_auth') {
            const { code, state: returnedState } = event.data;
            console.log('Received auth callback with state:', returnedState);

            // Verify state
            const savedState = localStorage.getItem('linkedin_auth_state');
            console.log('Saved state:', savedState);
            
            if (returnedState !== savedState) {
              throw new Error('Invalid state parameter');
            }

            console.log('Received auth code, exchanging for token...');

            // Exchange code for access token using edge function
            const { data: authData, error: authError } = await supabase.functions.invoke(
              'linkedin-auth',
              {
                body: { 
                  code,
                  redirectUri
                }
              }
            );

            if (authError) {
              throw new Error('Failed to authenticate with LinkedIn');
            }

            const { accessToken, profileData } = authData;

            console.log('Successfully got profile data:', profileData);

            // Save account to database
            const { error: dbError } = await supabase
              .from('social_accounts')
              .insert({
                platform: 'linkedin',
                account_name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
                access_token: accessToken,
                token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
                user_id: user.id,
                linkedin_user_id: profileData.id
              });

            if (dbError) {
              throw dbError;
            }

            toast.success('LinkedIn account connected successfully');
            popup.close();
            window.location.reload(); // Refresh to show the new account
          } else if (event.data.type === 'linkedin_auth_error') {
            throw new Error(event.data.error);
          }
        } catch (error) {
          console.error('Error in message handler:', error);
          toast.error(error.message || 'Failed to connect LinkedIn account');
          popup?.close();
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup
      const cleanup = () => {
        window.removeEventListener('message', handleMessage);
        localStorage.removeItem('linkedin_auth_state');
      };

      // Set a timeout to cleanup if the popup is closed
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          cleanup();
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error) {
      console.error('LinkedIn auth error:', error);
      toast.error(error.message || 'Failed to connect LinkedIn account');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button 
      onClick={handleLinkedInAuth}
      disabled={isConnecting}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
    >
      {isConnecting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      ) : (
        <Linkedin className="h-5 w-5" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect LinkedIn'}
    </Button>
  );
};