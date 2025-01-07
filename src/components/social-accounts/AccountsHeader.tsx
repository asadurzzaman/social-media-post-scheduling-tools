import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface AccountsHeaderProps {
  onOpenDialog: () => void;
}

export const AccountsHeader = ({ onOpenDialog }: AccountsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Social accounts</h2>
        <p className="text-muted-foreground">Connect your social media accounts to start posting</p>
      </div>
      <div className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={onOpenDialog}>Add new account</Button>
          </DialogTrigger>
        </Dialog>
        <Button asChild>
          <Link to="/create-post">New post</Link>
        </Button>
      </div>
    </div>
  );
};