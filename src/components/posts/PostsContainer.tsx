import { useState } from "react";
import { toast } from "sonner";
import { PostList } from "./PostList";
import { CreatePostDialog } from "@/components/calendar/CreatePostDialog";
import { PostsHeader } from "./PostsHeader";
import { usePostsData } from "./usePostsData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "date-fns";
import { BulkActions } from "./BulkActions";
import { usePostRealtime } from "@/hooks/usePostRealtime";

export const PostsContainer = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'scheduled'>('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [shouldApplyFilter, setShouldApplyFilter] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const { data: posts, isLoading, refetch } = usePostsData(
    statusFilter,
    sortBy,
    shouldApplyFilter,
    startDate,
    endDate
  );

  // Enable real-time updates
  usePostRealtime(() => {
    refetch();
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

  const handleShowUpcoming = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(addDays(today, 1));
    setShouldApplyFilter(true);
    toast.success("Showing upcoming posts for today and tomorrow");
  };

  const handleApplyDateFilter = () => {
    setShouldApplyFilter(true);
    toast.success("Date filter applied");
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
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
        onStartDateChange={(date) => {
          setStartDate(date);
          setShouldApplyFilter(false);
        }}
        onEndDateChange={(date) => {
          setEndDate(date);
          setShouldApplyFilter(false);
        }}
        onShowUpcoming={handleShowUpcoming}
        onApplyDateFilter={handleApplyDateFilter}
      />

      <BulkActions
        selectedPosts={selectedPosts}
        onSuccess={refetch}
        onClearSelection={() => setSelectedPosts([])}
      />

      <PostList
        posts={posts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectedPosts={selectedPosts}
        onToggleSelect={togglePostSelection}
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
          userId={null}
          initialPost={selectedPost}
        />
      )}
    </div>
  );
};