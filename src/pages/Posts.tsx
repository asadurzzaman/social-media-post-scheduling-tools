import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { EditPostForm } from "@/components/posts/EditPostForm";
import { toast } from "sonner";
import { PostList } from "@/components/posts/PostList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = 'newest' | 'oldest' | 'scheduled';

const Posts = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', statusFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*, social_accounts(platform)');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'scheduled':
          query = query.order('scheduled_for', { ascending: true });
          break;
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
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
            user_id: '',
            social_accounts: { platform: 'draft' }
          }, ...allPosts];
        }
      }
      
      return allPosts;
    }
  });

  const handleDelete = async (postId: string) => {
    try {
      if (postId.startsWith('draft-')) {
        localStorage.removeItem('postDraft');
        toast.success("Draft deleted successfully");
        refetch();
        return;
      }

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
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="scheduled">Schedule Date</SelectItem>
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

        <PostList
          posts={posts}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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
      </div>
    </DashboardLayout>
  );
};

export default Posts;