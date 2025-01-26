import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { toast } from "sonner";
import { PostList } from "@/components/posts/PostList";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/posts/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Posts = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date>();
  const [postType, setPostType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        toast.error("Please log in to view posts");
        navigate('/auth');
      }
    };
    getCurrentUser();
  }, [navigate]);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["posts", userId, filterDate, postType, sortOrder],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId);

      // Apply date filter if selected
      if (filterDate) {
        const startOfDay = new Date(filterDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filterDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.gte('scheduled_for', startOfDay.toISOString())
          .lte('scheduled_for', endOfDay.toISOString());
      }

      // Apply post type filter
      if (postType === "upcoming") {
        query = query.gt('scheduled_for', new Date().toISOString());
      }

      // Apply sort order
      if (sortOrder === "newest") {
        query = query.order('scheduled_for', { ascending: false });
      } else {
        query = query.order('scheduled_for', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast.error("Failed to fetch posts");
        throw error;
      }
      return data || [];
    },
    enabled: !!userId
  });

  const handleEdit = (post: Post) => {
    // Handle edit functionality
    console.log("Editing post:", post);
  };

  const handleDelete = async (id: string) => {
    if (!userId) {
      toast.error("Please log in to delete posts");
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">My Posts</h2>
            <p className="text-muted-foreground">View and manage all your social media posts</p>
          </div>
          <Button asChild>
            <Link to="/create-post">
              <span className="mr-2">+</span> New post
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setPostType(postType === "upcoming" ? "all" : "upcoming")}
          >
            <Clock className="h-4 w-4" />
            {postType === "upcoming" ? "All Posts" : "Upcoming Posts"}
          </Button>

          <DatePicker
            date={filterDate}
            onDateChange={setFilterDate}
          />

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        <PostList 
          posts={posts || []} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Posts;