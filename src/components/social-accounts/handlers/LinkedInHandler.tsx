import { Button } from "@/components/ui/button";
import { Linkedin, AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkExistingAccount } from "@/utils/socialAccounts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
        toast.error("LinkedIn initialization failed", {
          description: (
            <Alert variant="destructive" className="border-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="pr-8">Failed to initialize LinkedIn login. Please try again.</AlertDescription>
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute right-2 top-2 hover:bg-red-50"
                onClick={() => toast.dismiss()}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          ),
        });
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
            toast.error("Security verification failed", {
              description: (
                <Alert variant="destructive" className="border-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="pr-8">LinkedIn authentication could not be verified. Please try again.</AlertDescription>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute right-2 top-2 hover:bg-red-50"
                    onClick={() => toast.dismiss()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              ),
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
                description: (
                  <Alert variant="destructive" className="border-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="pr-8">{error.message || "Failed to connect LinkedIn account"}</AlertDescription>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute right-2 top-2 hover:bg-red-50"
                      onClick={() => toast.dismiss()}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Alert>
                ),
              });
              return;
            }
            
            window.removeEventListener('message', handleMessage);
            popup?.close();
            
            if (data.success) {
              toast.success("LinkedIn account connected", {
                description: (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700 pr-8">
                      Your LinkedIn account was successfully connected
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
                ),
              });
              onSuccess();
            } else if (data.duplicate) {
              toast.error("Duplicate account", {
                description: (
                  <Alert variant="destructive" className="border-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="pr-8">This LinkedIn account is already connected</AlertDescription>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute right-2 top-2 hover:bg-red-50"
                      onClick={() => toast.dismiss()}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Alert>
                ),
              });
            }
          } catch (error) {
            console.error('LinkedIn auth error:', error);
            toast.error("Connection failed", {
              description: (
                <Alert variant="destructive" className="border-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="pr-8">Failed to connect LinkedIn account. Please try again.</AlertDescription>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute right-2 top-2 hover:bg-red-50"
                    onClick={() => toast.dismiss()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              ),
            });
          }
        } else if (event.data.type === 'linkedin_auth_error') {
          console.error('LinkedIn auth error:', event.data.error);
          toast.error("LinkedIn authentication failed", {
            description: (
              <Alert variant="destructive" className="border-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="pr-8">{event.data.error || "Failed to authenticate with LinkedIn"}</AlertDescription>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="absolute right-2 top-2 hover:bg-red-50"
                  onClick={() => toast.dismiss()}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Alert>
            ),
          });
          window.removeEventListener('message', handleMessage);
          popup?.close();
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('LinkedIn login error:', error);
      toast.error("LinkedIn initialization failed", {
        description: (
          <Alert variant="destructive" className="border-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="pr-8">Failed to start LinkedIn login process</AlertDescription>
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute right-2 top-2 hover:bg-red-50"
              onClick={() => toast.dismiss()}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        ),
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