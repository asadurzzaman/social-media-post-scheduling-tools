import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Pencil, Trash2, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { EditPostForm } from "@/components/posts/EditPostForm";
import { toast } from "sonner";
import { PostStatusBadge, PostStatus } from "@/components/posts/PostStatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Posts = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*, social_accounts(platform)');

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      // Always order by created_at, with most recent first
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Include drafts from localStorage if viewing all or specifically draft posts
      let allPosts = data || [];
      
      if (statusFilter === 'all' || statusFilter === 'draft') {
        const draftJson = localStorage.getItem('postDraft');
        if (draftJson) {
          const draft = JSON.parse(draftJson);
          allPosts = [{
            id: 'draft-' + Date.now(),
            content: draft.content || '',
            status: 'draft',
            created_at: new Date().toISOString(),
            scheduled_for: draft.date || new Date().toISOString(),
            hashtags: [],
            image_url: null,
            poll_options: [],
            social_account_id: draft.selectedAccount || '',
            timezone: draft.timezone || 'UTC',
            user_id: '', // This will be filtered out by RLS if trying to access DB
            social_accounts: { platform: 'draft' }
          }, ...allPosts];
        }
      }
      
      return allPosts;
    }
  });

  const handleDelete = async (postId: string) => {
    try {
      // Handle draft deletion from localStorage
      if (postId.startsWith('draft-')) {
        localStorage.removeItem('postDraft');
        toast.success("Draft deleted successfully");
        refetch();
        return;
      }

      // Handle regular post deletion from database
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast.success("Post deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = (post: any) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

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
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {format(new Date(post.scheduled_for), 'PPP p')}
                      </span>
                      <PostStatusBadge status={post.status as PostStatus} />
                      {post.social_accounts?.platform === 'facebook' && (
                        <Facebook className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <EditPostForm
              post={selectedPost}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Posts;
