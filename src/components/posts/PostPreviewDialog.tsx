import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Facebook } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PostPreviewDialogProps {
  post: {
    content: string;
    image_url?: string | null;
    scheduled_for: string;
    social_accounts?: {
      platform: string;
      account_name?: string;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostPreviewDialog = ({ post, open, onOpenChange }: PostPreviewDialogProps) => {
  const isVideo = post.image_url?.includes('.mp4') || post.image_url?.includes('.mov');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-white overflow-hidden max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="bg-[#1877F2] p-1.5 rounded-full">
            <Facebook className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">{post.social_accounts?.account_name || "Facebook Page"}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(post.scheduled_for), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 h-[calc(80vh-160px)]">
          <div className="p-4">
            <p className="whitespace-pre-wrap mb-4">{post.content}</p>
            
            {post.image_url && (
              <div className="rounded-lg overflow-hidden bg-gray-100">
                {isVideo ? (
                  <video
                    src={post.image_url}
                    controls
                    className="w-full h-auto"
                  />
                ) : (
                  <img
                    src={post.image_url}
                    alt="Post media"
                    className="w-full h-auto"
                  />
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t mt-auto">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>0 Likes</span>
            <span>0 Comments</span>
            <span>0 Shares</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};