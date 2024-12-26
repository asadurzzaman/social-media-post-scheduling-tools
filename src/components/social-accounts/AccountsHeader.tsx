import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
      <Dialog>
        <DialogTrigger asChild>
          <Button onClick={onOpenDialog}>Add new account</Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
};