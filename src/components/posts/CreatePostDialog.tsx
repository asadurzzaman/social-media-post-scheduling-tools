import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatePostForm } from "./CreatePostForm";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePostDialog = ({
  isOpen,
  onClose,
  onSuccess,
}: CreatePostDialogProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error checking auth status:", error);
        toast.error("Authentication error");
        navigate("/auth");
        return;
      }
      
      if (!user) {
        toast.error("Please log in to create posts");
        navigate("/auth");
        return;
      }
      
      setUserId(user.id);
    };
    
    getCurrentUser();
  }, [navigate]);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("platform", "facebook");
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId // Only fetch accounts when user is authenticated
  });

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <CreatePostForm 
            accounts={accounts || []} 
            userId={userId}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};