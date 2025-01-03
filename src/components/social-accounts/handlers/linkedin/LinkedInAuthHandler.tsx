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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Get LinkedIn credentials from environment
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      if (!clientId) {
        throw new Error('LinkedIn client ID not configured');
      }

      // Generate random state for CSRF protection
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('linkedin_auth_state', state);

      // Calculate redirect URI
      const redirectUri = `${window.location.origin}/linkedin-callback.html`;

      // Construct LinkedIn OAuth URL
      const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social');
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;

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
      window.addEventListener('message', async (event) => {
        if (event.data.type === 'linkedin_auth') {
          const { code, state: returnedState } = event.data;

          // Verify state
          const savedState = localStorage.getItem('linkedin_auth_state');
          if (returnedState !== savedState) {
            throw new Error('Invalid state parameter');
          }

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

          // Save account to database
          const { error: dbError } = await supabase
            .from('social_accounts')
            .insert({
              platform: 'linkedin',
              account_name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
              access_token: accessToken,
              avatar_url: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
              token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
              user_id: user.id,
              linkedin_user_id: profileData.id,
              linkedin_profile_url: `https://www.linkedin.com/in/${profileData.id}`
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
      });
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      toast.error(error.message || 'Failed to connect LinkedIn account');
    } finally {
      setIsConnecting(false);
      localStorage.removeItem('linkedin_auth_state');
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