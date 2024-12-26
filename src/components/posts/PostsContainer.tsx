import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PostList } from "./PostList";
import { CreatePostDialog } from "@/components/calendar/CreatePostDialog";
import { PostsHeader } from "./PostsHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, isWithinInterval } from "date-fns";

type SortOption = 'newest' | 'oldest' | 'scheduled';

export const PostsContainer = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [userId, setUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

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
      
      // Apply date filtering if dates are selected
      if (startDate || endDate) {
        allPosts = allPosts.filter(post => {
          const postDate = new Date(post.scheduled_for);
          
          if (startDate && endDate) {
            return isWithinInterval(postDate, {
              start: startOfDay(startDate),
              end: endOfDay(endDate)
            });
          } else if (startDate) {
            return postDate >= startOfDay(startDate);
          } else if (endDate) {
            return postDate <= endOfDay(endDate);
          }
          return true;
        });
      }

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
            group_id: null,
            social_accounts: { platform: 'draft' }
          }, ...allPosts];
        }
      }
      
      return allPosts;
    }
  });

  const { data: accounts } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("platform", "facebook");
      
      if (error) throw error;
      return data;
    },
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    toast.success("Posts refreshed successfully");
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <PostsHeader
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <PostList
        posts={posts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {selectedPost && (
        <CreatePostDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedPost(null);
            refetch();
          }}
          selectedDate={selectedPost.scheduled_for ? new Date(selectedPost.scheduled_for) : null}
          accounts={accounts || []}
          userId={userId}
          initialPost={selectedPost}
        />
      )}
    </div>
  );
};