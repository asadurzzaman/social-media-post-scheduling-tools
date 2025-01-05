import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import LinkedInLoginButton from "@/components/LinkedInLoginButton";
import { toast } from "sonner";

interface ConnectAccountDialogProps {
  onSuccess: (response: { accessToken: string; userId: string }) => Promise<void>;
  onLinkedInSuccess: (response: { accessToken: string; userId: string }) => Promise<void>;
}

export const ConnectAccountDialog = ({ onSuccess, onLinkedInSuccess }: ConnectAccountDialogProps) => {
  const handleFacebookError = (error: string) => {
    console.error('Facebook connection error:', error);
    toast.error('Failed to connect Facebook account. Please check your permissions and try again.');
  };

  const handleLinkedInError = (error: string) => {
    console.error('LinkedIn connection error:', error);
    toast.error('Failed to connect LinkedIn account. Please try again.');
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
          appId={import.meta.env.VITE_FACEBOOK_APP_ID || '2579075792280951'}
          onSuccess={onSuccess}
          onError={handleFacebookError}
        />
        <LinkedInLoginButton
          clientId={import.meta.env.VITE_LINKEDIN_CLIENT_ID || ''}
          onSuccess={onLinkedInSuccess}
          onError={handleLinkedInError}
        />
        <Button className="w-full" variant="outline" disabled>Instagram (Coming soon)</Button>
        <Button className="w-full" variant="outline" disabled>X/Twitter (Coming soon)</Button>
        <Button className="w-full" variant="outline" disabled>TikTok (Coming soon)</Button>
      </div>
    </DialogContent>
  );
};