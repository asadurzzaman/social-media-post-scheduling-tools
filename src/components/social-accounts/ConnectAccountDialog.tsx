import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstagramAuthHandler } from "./handlers/instagram/InstagramAuthHandler";
import { LinkedInAuthHandler } from "./handlers/linkedin/LinkedInAuthHandler";
import { FacebookPageManager } from "./handlers/facebook/FacebookPageManager";
import { Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <FacebookPageManager />
        <InstagramAuthHandler />
        <LinkedInAuthHandler />
        <Button className="w-full flex items-center justify-center gap-2" variant="outline" disabled>
          <Twitter className="h-5 w-5" />
          Twitter (Coming soon)
        </Button>
      </div>
    </DialogContent>
  );
};