import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import LinkedInLoginButton from "@/components/LinkedInLoginButton";
import InstagramLoginButton from "@/components/InstagramLoginButton";
import { toast } from "sonner";

interface ConnectAccountDialogProps {
  onSuccess: (response: { accessToken: string; userId: string }) => Promise<void>;
  onLinkedInSuccess: (response: { accessToken: string; userId: string }) => Promise<void>;
  onInstagramSuccess: (response: { accessToken: string; userId: string }) => Promise<void>;
}

export const ConnectAccountDialog = ({ 
  onSuccess, 
  onLinkedInSuccess,
  onInstagramSuccess 
}: ConnectAccountDialogProps) => {
  const handleFacebookError = (error: string) => {
    toast.error(error);
  };

  const handleLinkedInError = (error: string) => {
    toast.error(error);
  };

  const handleInstagramError = (error: string) => {
    toast.error(error);
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
        <LinkedInLoginButton
          clientId={import.meta.env.VITE_LINKEDIN_CLIENT_ID || ''}
          onSuccess={onLinkedInSuccess}
          onError={handleLinkedInError}
        />
        <InstagramLoginButton
          appId="1294294115054311"
          onSuccess={onInstagramSuccess}
          onError={handleInstagramError}
        />
        <Button className="w-full" variant="outline" disabled>X/Twitter (Coming soon)</Button>
        <Button className="w-full" variant="outline" disabled>TikTok (Coming soon)</Button>
      </div>
    </DialogContent>
  );
};