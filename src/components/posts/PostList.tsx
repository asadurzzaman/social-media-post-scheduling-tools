import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PostListProps {
  posts: any[];
  onEdit: (post: any) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const PostList = ({ posts, onEdit, onDelete, isLoading }: PostListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts found</p>
        <Button asChild className="mt-4">
          <Link to="/create-post">Create your first post</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};