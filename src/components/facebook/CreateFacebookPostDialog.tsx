import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateFacebookPost } from "./CreateFacebookPost";

interface CreateFacebookPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
}

export const CreateFacebookPostDialog = ({
  isOpen,
  onClose,
  pageId,
}: CreateFacebookPostDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Facebook Post</DialogTitle>
        </DialogHeader>
        <CreateFacebookPost 
          pageId={pageId} 
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};