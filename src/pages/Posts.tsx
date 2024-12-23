import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const Posts = () => {
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Posts</h2>
            <p className="text-muted-foreground">
              View and manage all your social media posts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/create-post" className="gap-2">
                <Plus className="h-4 w-4" />
                New post
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts?.map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {format(new Date(post.scheduled_for), 'PPP p')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{post.content}</p>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post preview"
                      className="mt-2 rounded-md max-w-[200px] h-auto"
                    />
                  )}
                </div>
              </div>
            ))}
            {posts?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found</p>
                <Button asChild className="mt-4">
                  <Link to="/create-post">Create your first post</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Posts;