import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FacebookLoginButton from '../FacebookLoginButton';
import { toast } from 'sonner';

interface ReconnectFacebookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onSuccess?: () => void;
}

export const ReconnectFacebookDialog = ({
  isOpen,
  onClose,
  accountId,
  onSuccess,
}: ReconnectFacebookDialogProps) => {
  const handleSuccess = () => {
    toast.success('Facebook account reconnected successfully');
    onSuccess?.();
    onClose();
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reconnect Facebook Account</DialogTitle>
          <DialogDescription>
            Your Facebook access has expired. Please reconnect your account to continue posting.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FacebookLoginButton
            appId={import.meta.env.VITE_FACEBOOK_APP_ID}
            onSuccess={handleSuccess}
            onError={handleError}
            isReconnect={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};