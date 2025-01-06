import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

interface AccountsHeaderProps {
  onOpenDialog: () => void;
}

export const AccountsHeader = ({ onOpenDialog }: AccountsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Social accounts</h2>
        <p className="text-muted-foreground mt-1">Connect your social media accounts to start posting</p>
      </div>
      <div className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={onOpenDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add new account
            </Button>
          </DialogTrigger>
        </Dialog>
        <Button asChild variant="outline">
          <Link to="/create-post">New post</Link>
        </Button>
      </div>
    </div>
  );
};