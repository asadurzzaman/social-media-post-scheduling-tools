import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkExistingAccount } from "@/utils/socialAccounts";

interface LinkedInHandlerProps {
  onSuccess: () => void;
}

export const LinkedInHandler = ({ onSuccess }: LinkedInHandlerProps) => {
  const handleLinkedInLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/linkedin-callback.html`;
      const scope = 'w_member_social';
      const state = crypto.randomUUID();
      
      const { data: { linkedin_client_id }, error: secretError } = await supabase.functions.invoke('get-linkedin-credentials');
      
      if (secretError) {
        console.error('Error fetching LinkedIn credentials:', secretError);
        toast.error('Failed to initialize LinkedIn login');
        return;
      }

      // Store state for security verification
      sessionStorage.setItem('linkedin_state', state);

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedin_client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
      
      const popup = window.open(authUrl, 'LinkedIn Login', 'width=600,height=700');
      
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          return;
        }
        
        if (event.data.type === 'linkedin_auth') {
          const { code, state: receivedState } = event.data;
          
          // Verify state matches
          const storedState = sessionStorage.getItem('linkedin_state');
          if (receivedState !== storedState) {
            console.error('State mismatch:', { receivedState, storedState });
            toast.error('Security verification failed');
            return;
          }

          try {
            const { data, error } = await supabase.functions.invoke('linkedin-auth', {
              body: { 
                code,
                redirectUri,
                state
              }
            });
            
            if (error) {
              console.error('LinkedIn auth error:', error);
              toast.error('Failed to connect LinkedIn account');
              return;
            }
            
            window.removeEventListener('message', handleMessage);
            popup?.close();
            
            if (data.success) {
              toast.success('LinkedIn account connected successfully!');
              onSuccess();
            } else if (data.duplicate) {
              toast.error('This LinkedIn account is already connected');
            }
          } catch (error) {
            console.error('LinkedIn auth error:', error);
            toast.error('Failed to connect LinkedIn account');
          }
        } else if (event.data.type === 'linkedin_auth_error') {
          console.error('LinkedIn auth error:', event.data.error);
          toast.error(`LinkedIn authentication failed: ${event.data.error}`);
          window.removeEventListener('message', handleMessage);
          popup?.close();
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('LinkedIn login error:', error);
      toast.error('Failed to initiate LinkedIn login');
    }
  };

  return (
    <Button 
      className="w-full flex items-center justify-center gap-2" 
      variant="outline" 
      onClick={handleLinkedInLogin}
    >
      <Linkedin className="w-5 h-5 text-[#0A66C2]" />
      Connect LinkedIn
    </Button>
  );
};