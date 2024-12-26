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
      const instagramClientId = '1294294115054311'; // Using the same app ID as Facebook since Instagram uses Facebook's app
      const redirectUri = `${window.location.origin}/auth/instagram/callback`;
      // Updated scope to use the correct Instagram Basic Display API permissions
      const scope = 'basic';
      
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramClientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      
      // Open Instagram auth in a popup
      window.open(authUrl, 'Instagram Login', 'width=600,height=700');
      
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
            toast.error('Failed to connect Instagram account');
            return;
          }
          
          if (data.accessToken) {
            onSuccess({
              accessToken: data.accessToken,
              userId: data.userId
            });
          }
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