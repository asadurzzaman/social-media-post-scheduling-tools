import { format } from "date-fns";
import { Facebook, Pencil, Trash2, Image, Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostStatus, PostStatusBadge } from "./PostStatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    status: PostStatus;
    scheduled_for: string;
    image_url?: string | null;
    social_accounts?: {
      platform: string;
    };
  };
  onEdit: (post: any) => void;
  onDelete: (id: string) => void;
}

export const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
  const hasMedia = post.image_url;
  const isVideo = post.image_url?.includes('.mp4') || post.image_url?.includes('.mov');

  return (
    <Card className={cn(
      "h-full flex flex-col bg-white hover:shadow-lg transition-shadow duration-200",
      hasMedia && "relative"
    )}>
      <CardHeader className="flex-none space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {format(new Date(post.scheduled_for), 'PPP p')}
            </span>
            <PostStatusBadge status={post.status} />
            {post.social_accounts?.platform === 'facebook' && (
              <Facebook className="h-4 w-4 text-blue-600" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(post)}
              className="hover:bg-gray-100"
            >
              <Pencil className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col relative">
        <p className="text-sm text-gray-600 mb-4 flex-1">{post.content}</p>
        {hasMedia && (
          <div className="mt-auto relative group">
            {/* Media preview */}
            {isVideo ? (
              <div className="relative">
                <video
                  src={post.image_url}
                  className="rounded-md w-full h-32 object-cover"
                />
                <Film className="absolute top-2 left-2 h-6 w-6 text-white drop-shadow-lg" />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={post.image_url}
                  alt="Post preview"
                  className="rounded-md w-full h-32 object-cover"
                />
                <Image className="absolute top-2 left-2 h-6 w-6 text-white drop-shadow-lg" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(post.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};