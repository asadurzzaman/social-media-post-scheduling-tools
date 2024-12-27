import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  showSuccessToast, 
  showErrorToast, 
  checkExistingLinkedInAccount,
  saveLinkedInAccount 
} from "./linkedin/linkedinUtils";
import { 
  initializeLinkedInAuth, 
  verifyState, 
  createAuthWindow 
} from "./linkedin/LinkedInAuthFlow";

interface LinkedInHandlerProps {
  onSuccess: () => void;
}

export const LinkedInHandler = ({ onSuccess }: LinkedInHandlerProps) => {
  const handleLinkedInLogin = async () => {
    try {
      const { redirectUri, scope, state } = initializeLinkedInAuth();
      
      const { data: { linkedin_client_id }, error: secretError } = await supabase
        .functions.invoke('get-linkedin-credentials');
      
      if (secretError) {
        console.error('Error fetching LinkedIn credentials:', secretError);
        showErrorToast("Failed to initialize LinkedIn login. Please try again.");
        return;
      }

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedin_client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
      
      const popup = createAuthWindow(authUrl);
      
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'linkedin_auth') {
          const { code, state: receivedState } = event.data;
          
          if (!verifyState(receivedState)) {
            console.error('State mismatch:', { receivedState });
            showErrorToast("LinkedIn authentication could not be verified. Please try again.");
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
              showErrorToast(error.message || "Failed to connect LinkedIn account");
              return;
            }
            
            window.removeEventListener('message', handleMessage);
            popup?.close();
            
            if (data.success) {
              showSuccessToast();
              onSuccess();
            } else if (data.duplicate) {
              showErrorToast("This LinkedIn account is already connected");
            }
          } catch (error) {
            console.error('LinkedIn auth error:', error);
            showErrorToast("Failed to connect LinkedIn account. Please try again.");
          }
        } else if (event.data.type === 'linkedin_auth_error') {
          console.error('LinkedIn auth error:', event.data.error);
          showErrorToast(event.data.error || "Failed to authenticate with LinkedIn");
          window.removeEventListener('message', handleMessage);
          popup?.close();
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('LinkedIn login error:', error);
      showErrorToast("Failed to start LinkedIn login process");
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