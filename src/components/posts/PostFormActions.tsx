import { Button } from "@/components/ui/button";

interface PostFormActionsProps {
  onSubmit: (e: React.FormEvent) => void;
  isDraft: boolean;
  onClearDraft: () => void;
  onPublishNow?: () => void;
}

export const PostFormActions = ({ 
  onSubmit, 
  isDraft, 
  onClearDraft,
  onPublishNow
}: PostFormActionsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex gap-4">
        {onPublishNow && (
          <Button type="button" onClick={onPublishNow} className="flex-1 bg-green-600 hover:bg-green-700">
            Publish Now
          </Button>
        )}
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