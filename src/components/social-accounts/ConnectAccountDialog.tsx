import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import { toast } from "sonner";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConnectAccountDialogProps {
  onSuccess: (response: { accessToken: string; userId: string }) => Promise<void>;
}

export const ConnectAccountDialog = ({ onSuccess }: ConnectAccountDialogProps) => {
  const handleFacebookError = (error: string) => {
    toast.error(error);
  };

  const handleInstagramLogin = async () => {
    try {
      // Instagram OAuth URL construction
      const redirectUri = `${window.location.origin}/instagram-callback.html`;
      // Updated scopes for Instagram Graph API
      const scope = 'instagram_basic,instagram_content_publish';
      
      const { data: { instagram_app_id }, error: secretError } = await supabase.functions.invoke('get-instagram-credentials');
      
      if (secretError) {
        console.error('Error fetching Instagram credentials:', secretError);
        toast.error('Failed to initialize Instagram login');
        return;
      }

      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagram_app_id}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      
      // Open Instagram auth in a popup
      const popup = window.open(authUrl, 'Instagram Login', 'width=600,height=700');
      
      // Listen for the callback message from the popup
      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'instagram_auth') {
          const { code } = event.data;
          
          // Exchange the code for an access token using your backend
          const { data, error } = await supabase.functions.invoke('instagram-auth', {
            body: { code, redirectUri }
          });
          
          if (error) {
            console.error('Instagram auth error:', error);
            toast.error('Failed to connect Instagram account');
            return;
          }
          
          // Save the Instagram account in Supabase
          const { data: session } = await supabase.auth.getSession();
          if (!session?.session?.user) {
            toast.error('No active session found');
            return;
          }

          const { error: insertError } = await supabase
            .from('social_accounts')
            .insert({
              user_id: session.session.user.id,
              platform: 'instagram',
              account_name: data.username,
              access_token: data.accessToken,
              instagram_user_id: data.userId,
              instagram_username: data.username,
              token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
            });

          if (insertError) {
            console.error('Error saving Instagram account:', insertError);
            toast.error('Failed to save Instagram account');
            return;
          }

          toast.success('Instagram account connected successfully!');
          popup?.close();
          onSuccess({ accessToken: data.accessToken, userId: data.userId });
        } else if (event.data.type === 'instagram_auth_error') {
          console.error('Instagram auth error:', event.data.error);
          toast.error('Failed to connect Instagram account');
          popup?.close();
        }
      });
    } catch (error) {
      console.error('Instagram login error:', error);
      toast.error('Failed to initiate Instagram login');
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
        <Button className="w-full" variant="outline" disabled>LinkedIn (Coming soon)</Button>
        <Button className="w-full" variant="outline" disabled>X/Twitter (Coming soon)</Button>
        <Button className="w-full" variant="outline" disabled>TikTok (Coming soon)</Button>
      </div>
    </DialogContent>
  );
};