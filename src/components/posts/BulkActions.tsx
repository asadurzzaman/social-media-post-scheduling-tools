import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BulkActionsProps {
  selectedPosts: string[];
  onSuccess: () => void;
  onClearSelection: () => void;
}

export const BulkActions = ({ selectedPosts, onSuccess, onClearSelection }: BulkActionsProps) => {
  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .in('id', selectedPosts);

      if (error) throw error;

      toast.success(`${selectedPosts.length} posts deleted successfully`);
      onSuccess();
      onClearSelection();
    } catch (error) {
      console.error('Error deleting posts:', error);
      toast.error('Failed to delete posts');
    }
  };

  if (selectedPosts.length === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-4">
      <span className="text-sm font-medium">
        {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
      </span>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleBulkDelete}
      >
        Delete Selected
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearSelection}
      >
        Clear Selection
      </Button>
    </div>
  );
};