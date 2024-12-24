import { format } from "date-fns";
import { Facebook, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostStatus, PostStatusBadge } from "./PostStatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  return (
    <Card className="h-full flex flex-col bg-white hover:shadow-lg transition-shadow duration-200">
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
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-gray-600 mb-4 flex-1">{post.content}</p>
        {post.image_url && (
          <div className="mt-auto">
            <img
              src={post.image_url}
              alt="Post preview"
              className="rounded-md w-full h-32 object-cover"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};