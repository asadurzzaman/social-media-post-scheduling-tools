import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  showSuccessToast, 
  showErrorToast, 
  checkExistingLinkedInAccount,
  saveLinkedInAccount 
} from "./linkedinUtils";
import { 
  initializeLinkedInAuth, 
  verifyState, 
  createAuthWindow 
} from "./LinkedInAuthFlow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

interface LinkedInHandlerProps {
  onSuccess: () => void;
}

const SuccessToast = () => (
  <Alert className="border-green-500 bg-green-50">
    <CheckCircle2 className="h-4 w-4 text-green-600" />
    <AlertTitle className="text-green-800">Success</AlertTitle>
    <AlertDescription className="text-green-700 pr-8">
      Successfully connected LinkedIn account
    </AlertDescription>
    <Button 
      size="sm" 
      variant="ghost" 
      className="absolute right-2 top-2 hover:bg-green-50"
      onClick={() => toast.dismiss()}
    >
      <X className="h-4 w-4 text-green-600" />
    </Button>
  </Alert>
);

const ErrorToast = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="border-red-500">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription className="pr-8">{message}</AlertDescription>
    <Button 
      size="sm" 
      variant="ghost" 
      className="absolute right-2 top-2 hover:bg-red-50"
      onClick={() => toast.dismiss()}
    >
      <X className="h-4 w-4" />
    </Button>
  </Alert>
);

export const LinkedInHandler = ({ onSuccess }: LinkedInHandlerProps) => {
  const handleLinkedInLogin = async () => {
    try {
      const { redirectUri, scope, state } = initializeLinkedInAuth();
      
      const { data: { linkedin_client_id }, error: secretError } = await supabase
        .functions.invoke('get-linkedin-credentials');
      
      if (secretError) {
        console.error('Error fetching LinkedIn credentials:', secretError);
        toast.error("Failed to initialize LinkedIn login", {
          description: <ErrorToast message="Please try again." />
        });
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
            toast.error("LinkedIn authentication failed", {
              description: <ErrorToast message="Authentication could not be verified. Please try again." />
            });
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
              toast.error("LinkedIn connection failed", {
                description: <ErrorToast message={error.message || "Failed to connect LinkedIn account"} />
              });
              return;
            }
            
            window.removeEventListener('message', handleMessage);
            popup?.close();
            
            if (data.success) {
              toast.success("LinkedIn account connected", {
                description: <SuccessToast />
              });
              onSuccess();
            } else if (data.duplicate) {
              toast.error("LinkedIn connection failed", {
                description: <ErrorToast message="This LinkedIn account is already connected" />
              });
            }
          } catch (error) {
            console.error('LinkedIn auth error:', error);
            toast.error("LinkedIn connection failed", {
              description: <ErrorToast message="Failed to connect LinkedIn account. Please try again." />
            });
          }
        } else if (event.data.type === 'linkedin_auth_error') {
          console.error('LinkedIn auth error:', event.data.error);
          toast.error("LinkedIn authentication failed", {
            description: <ErrorToast message={event.data.error || "Failed to authenticate with LinkedIn"} />
          });
          window.removeEventListener('message', handleMessage);
          popup?.close();
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('LinkedIn login error:', error);
      toast.error("LinkedIn login failed", {
        description: <ErrorToast message="Failed to start LinkedIn login process" />
      });
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