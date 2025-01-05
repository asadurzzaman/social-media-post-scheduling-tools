import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatePostForm } from "../posts/CreatePostForm";
import { format } from "date-fns";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  accounts: any[];
  userId: string | null;
}

export const CreatePostDialog = ({
  isOpen,
  onClose,
  selectedDate,
  accounts,
  userId,
}: CreatePostDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create Post for {selectedDate ? format(selectedDate, 'PPP p') : ''}
          </DialogTitle>
        </DialogHeader>
        <CreatePostForm 
          accounts={accounts} 
          userId={userId}
          initialDate={selectedDate || undefined}
        />
      </DialogContent>
    </Dialog>
  );
};