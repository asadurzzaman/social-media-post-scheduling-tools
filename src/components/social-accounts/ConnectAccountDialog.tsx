import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { FacebookHandler } from "./handlers/FacebookHandler";
import { LinkedInHandler } from "./handlers/LinkedInHandler";

interface ConnectAccountDialogProps {
  onSuccess: () => void;
}

export const ConnectAccountDialog = ({ onSuccess }: ConnectAccountDialogProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a new social media account</DialogTitle>
        <DialogDescription>
          Choose a platform to connect your social media account
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <FacebookHandler onSuccess={onSuccess} />
        <Button 
          className="w-full flex items-center justify-center gap-2" 
          variant="outline" 
          disabled
        >
          <Instagram className="w-5 h-5 text-pink-600" />
          Connect Instagram (Coming soon)
        </Button>
        <LinkedInHandler onSuccess={onSuccess} />
        <Button className="w-full" variant="outline" disabled>X/Twitter (Coming soon)</Button>
        <Button className="w-full" variant="outline" disabled>TikTok (Coming soon)</Button>
      </div>
    </DialogContent>
  );
};