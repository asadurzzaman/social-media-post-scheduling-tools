import { Button } from "@/components/ui/button";

interface PostFormActionsProps {
  onSubmit: (e: React.FormEvent) => void;
  isDraft: boolean;
  onClearDraft: () => void;
  onPublishNow?: () => void;
  onSaveDraft?: () => void;
}

export const PostFormActions = ({ 
  onSubmit, 
  isDraft, 
  onClearDraft,
  onPublishNow,
  onSaveDraft
}: PostFormActionsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {onPublishNow && (
          <Button 
            type="button" 
            onClick={onPublishNow} 
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Publish Now
          </Button>
        )}
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          Schedule Post
        </Button>
        <div className="flex gap-2 flex-1">
          {onSaveDraft && (
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onSaveDraft}
              className="flex-1"
            >
              Save Draft
            </Button>
          )}
          {isDraft && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClearDraft}
              className="flex-1"
            >
              Clear Draft
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};