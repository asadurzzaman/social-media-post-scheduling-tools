import { Button } from "@/components/ui/button";

interface PostFormActionsProps {
  onSubmit: (e: React.FormEvent) => void;
  isDraft: boolean;
  onClearDraft: () => void;
}

export const PostFormActions = ({ 
  onSubmit, 
  isDraft, 
  onClearDraft 
}: PostFormActionsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Schedule Post
        </Button>
        {isDraft && (
          <Button type="button" variant="outline" onClick={onClearDraft}>
            Clear Draft
          </Button>
        )}
      </div>
    </form>
  );
};