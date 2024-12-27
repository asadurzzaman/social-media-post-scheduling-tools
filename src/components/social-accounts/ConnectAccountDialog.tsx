import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import { toast } from "sonner";
import { Instagram, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConnectAccountDialogProps {
  onSuccess: () => void;
}

export const ConnectAccountDialog = ({ onSuccess }: ConnectAccountDialogProps) => {
  const handleFacebookSuccess = async ({ accessToken, userId }: { accessToken: string; userId: string }) => {
    try {
      // Get Facebook Pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        console.error("Facebook API Error:", pagesData.error);
        toast.error("Error fetching Facebook pages: " + pagesData.error.message);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No active session found");
        return;
      }

      if (pagesData.data && pagesData.data.length > 0) {
        // Insert all pages as separate accounts
        for (const page of pagesData.data) {
          const { error: insertError } = await supabase
            .from('social_accounts')
            .insert({
              user_id: session.user.id,
              platform: 'facebook',
              account_name: page.name,
              access_token: page.access_token,
              page_id: page.id,
              page_access_token: page.access_token,
              token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
            });

          if (insertError) {
            console.error("Error saving account:", insertError);
            toast.error(`Failed to save Facebook page: ${page.name}`);
            return;
          }
        }

        toast.success(`Successfully connected ${pagesData.data.length} Facebook page(s)!`);
        onSuccess();
      } else {
        toast.error("No Facebook pages found. Please make sure you have a Facebook page.");
      }
    } catch (error) {
      console.error("Error processing Facebook connection:", error);
      toast.error("Failed to connect Facebook account");
    }
  };

  const handleFacebookError = (error: string) => {
    toast.error(error);
  };

  const handleLinkedInLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/linkedin-callback.html`;
      // Remove r_liteprofile scope as it's not authorized
      const scope = 'w_member_social';
      const state = window.location.origin;
      
      const { data: { linkedin_client_id }, error: secretError } = await supabase.functions.invoke('get-linkedin-credentials');
      
      if (secretError) {
        console.error('Error fetching LinkedIn credentials:', secretError);
        toast.error('Failed to initialize LinkedIn login');
        return;
      }

      // Generate and store a random state value
      const stateValue = crypto.randomUUID();
      sessionStorage.setItem('linkedin_state', stateValue);

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedin_client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(stateValue)}`;
      
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
                state: window.location.origin
              }
            });
            
            if (error) {
              console.error('LinkedIn auth error:', error);
              toast.error('Failed to connect LinkedIn account');
              return;
            }
            
            window.removeEventListener('message', handleMessage);
            popup?.close();
            
            toast.success('LinkedIn account connected successfully!');
            onSuccess();
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a new social media account</DialogTitle>
        <DialogDescription>
          Choose a platform to connect your social media account
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <FacebookLoginButton
          appId="1294294115054311"
          onSuccess={handleFacebookSuccess}
          onError={handleFacebookError}
        />
        <Button 
          className="w-full flex items-center justify-center gap-2" 
          variant="outline" 
          disabled
        >
          <Instagram className="w-5 h-5 text-pink-600" />
          Connect Instagram (Coming soon)
        </Button>
        <Button 
          className="w-full flex items-center justify-center gap-2" 
          variant="outline" 
          onClick={handleLinkedInLogin}
        >
          <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          Connect LinkedIn
        </Button>
        <Button className="w-full" variant="outline" disabled>X/Twitter (Coming soon)</Button>
        <Button className="w-full" variant="outline" disabled>TikTok (Coming soon)</Button>
      </div>
    </DialogContent>
  );
};