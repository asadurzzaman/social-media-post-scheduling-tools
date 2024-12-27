import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import { toast } from "sonner";
import { Instagram, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConnectAccountDialogProps {
  onSuccess: (response: { accessToken: string; userId: string }) => Promise<void>;
}

export const ConnectAccountDialog = ({ onSuccess }: ConnectAccountDialogProps) => {
  const handleFacebookError = (error: string) => {
    toast.error(error);
  };

  const handleLinkedInSuccess = async (data: { accessToken: string; userId: string; username: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No active session found");
        return;
      }

      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          user_id: session.user.id,
          platform: 'linkedin',
          account_name: data.username,
          access_token: data.accessToken,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (insertError) {
        console.error("Error saving LinkedIn account:", insertError);
        toast.error("Failed to save LinkedIn account");
        return;
      }

      toast.success("LinkedIn account connected successfully!");
      await onSuccess({ accessToken: data.accessToken, userId: data.userId });
    } catch (error) {
      console.error("Error processing LinkedIn connection:", error);
      toast.error("Failed to connect LinkedIn account");
    }
  };

  const handleInstagramLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/instagram-callback.html`;
      const scope = 'instagram_basic,instagram_content_publish';
      
      const { data: { instagram_app_id }, error: secretError } = await supabase.functions.invoke('get-instagram-credentials');
      
      if (secretError) {
        console.error('Error fetching Instagram credentials:', secretError);
        toast.error('Failed to initialize Instagram login');
        return;
      }

      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagram_app_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;
      
      console.log('Opening Instagram auth URL:', authUrl);
      
      const popup = window.open(authUrl, 'Instagram Login', 'width=600,height=700');
      
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'instagram_auth') {
          const { code } = event.data;
          console.log('Received Instagram auth code:', code);
          
          const { data, error } = await supabase.functions.invoke('instagram-auth', {
            body: { code, redirectUri }
          });
          
          if (error) {
            console.error('Instagram auth error:', error);
            toast.error('Failed to connect Instagram account');
            return;
          }
          
          window.removeEventListener('message', handleMessage);
          popup?.close();
          onSuccess({ accessToken: data.accessToken, userId: data.userId });
        } else if (event.data.type === 'instagram_auth_error') {
          console.error('Instagram auth error:', event.data.error);
          toast.error('Failed to connect Instagram account');
          window.removeEventListener('message', handleMessage);
          popup?.close();
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Instagram login error:', error);
      toast.error('Failed to initiate Instagram login');
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      // Use the exact redirect URI that matches LinkedIn Developer Console
      const redirectUri = `${window.location.origin}/linkedin-callback.html`;
      const scope = 'w_member_social';
      
      const { data: { linkedin_client_id }, error: secretError } = await supabase.functions.invoke('get-linkedin-credentials');
      
      if (secretError) {
        console.error('Error fetching LinkedIn credentials:', secretError);
        toast.error('Failed to initialize LinkedIn login');
        return;
      }

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedin_client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(window.location.origin)}`;
      
      console.log('Opening LinkedIn auth URL:', authUrl);
      console.log('Redirect URI:', redirectUri);
      
      const popup = window.open(authUrl, 'LinkedIn Login', 'width=600,height=700');
      
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'linkedin_auth') {
          const { code } = event.data;
          console.log('Received LinkedIn auth code:', code);
          
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

          await handleLinkedInSuccess(data);
        } else if (event.data.type === 'linkedin_auth_error') {
          console.error('LinkedIn auth error:', event.data.error);
          toast.error('Failed to connect LinkedIn account');
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
          onSuccess={onSuccess}
          onError={handleFacebookError}
        />
        <Button 
          className="w-full flex items-center justify-center gap-2" 
          variant="outline" 
          onClick={handleInstagramLogin}
        >
          <Instagram className="w-5 h-5 text-pink-600" />
          Connect Instagram
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