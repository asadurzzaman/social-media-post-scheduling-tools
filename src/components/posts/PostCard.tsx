import { format } from "date-fns";
import { X, Pencil, Trash2, Image, Film, Clock } from "lucide-react";
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
      "group h-full flex flex-col bg-[#1A1F2C] text-white overflow-hidden hover:shadow-xl transition-all duration-300",
      "border-0 rounded-lg"
    )}>
      <div className="relative w-full aspect-video">
        {hasMedia ? (
          <>
            {isVideo ? (
              <video
                src={post.image_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={post.image_url}
                alt="Post preview"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2C] to-transparent opacity-90" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-t from-[#1A1F2C] to-[#2A2F3C]" />
        )}
        
        {/* Platform and Status Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {post.social_accounts?.platform === 'facebook' && (
            <X className="h-5 w-5 text-blue-400" />
          )}
          <PostStatusBadge status={post.status} />
        </div>
        
        {/* Media Type Indicator */}
        {hasMedia && (
          <div className="absolute top-4 right-4">
            {isVideo ? (
              <Film className="h-5 w-5 text-white/80" />
            ) : (
              <Image className="h-5 w-5 text-white/80" />
            )}
          </div>
        )}
      </div>

      <CardContent className="flex-1 flex flex-col p-6">
        {/* Schedule Time */}
        <div className="flex items-center gap-2 text-white/60 mb-3">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {format(new Date(post.scheduled_for), 'PPP p')}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-white/80 mb-6 flex-1 line-clamp-3">
          {post.content}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(post)}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="flex-1 bg-white/5 hover:bg-red-500/20 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};