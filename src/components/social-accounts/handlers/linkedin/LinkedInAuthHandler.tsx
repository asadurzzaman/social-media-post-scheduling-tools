import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";

interface LinkedInAuthHandlerProps {
  onSuccess: () => void;
}

export const LinkedInAuthHandler = ({ onSuccess }: LinkedInAuthHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUser();
  const [authWindow, setAuthWindow] = useState<Window | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'linkedin_auth_success') {
        const { code } = event.data;
        
        try {
          setIsLoading(true);
          const response = await fetch('/api/linkedin-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, userId }),
          });

          if (!response.ok) {
            throw new Error('Failed to authenticate with LinkedIn');
          }

          const data = await response.json();
          
          // Insert the account data into Supabase
          const { error: dbError } = await supabase
            .from('social_accounts')
            .insert({
              user_id: userId,
              platform: 'linkedin',
              account_name: data.name,
              access_token: data.accessToken,
              linkedin_user_id: data.id,
              linkedin_profile_url: data.profileUrl,
              avatar_url: data.pictureUrl,
            });

          if (dbError) {
            throw dbError;
          }

          toast.success('LinkedIn account connected successfully');
          onSuccess();
          
        } catch (error) {
          console.error('Error connecting LinkedIn account:', error);
          toast.error('Failed to connect LinkedIn account');
        } finally {
          setIsLoading(false);
          if (authWindow) {
            authWindow.close();
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [userId, onSuccess]);

  const handleConnect = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = `${window.location.origin}/linkedin-callback.html`;
    const scope = 'r_liteprofile r_emailaddress w_member_social';
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=random_state_string`;
    
    const width = 600;
    const height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const newWindow = window.open(
      authUrl,
      'LinkedIn Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    setAuthWindow(newWindow);
  };

  return (
    <Button
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
      onClick={handleConnect}
      disabled={isLoading}
    >
      <Linkedin className="h-5 w-5" />
      {isLoading ? 'Connecting...' : 'Connect LinkedIn'}
    </Button>
  );
};