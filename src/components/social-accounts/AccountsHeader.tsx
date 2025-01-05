import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface AccountsHeaderProps {
  onOpenDialog: () => void;
}

export const AccountsHeader = ({ onOpenDialog }: AccountsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Social accounts</h2>
        <p className="text-muted-foreground">Connect your social media accounts to start posting</p>
      </div>
      <div className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={onOpenDialog} className="bg-blue-600 hover:bg-blue-700">Add new account</Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
};