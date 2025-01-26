import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { toast } from "sonner";
import { PostList } from "@/components/posts/PostList";
import { useNavigate } from "react-router-dom";

const Posts = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

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

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId);
      
      if (error) {
        toast.error("Failed to fetch posts");
        throw error;
      }
      return data || [];
    },
    enabled: !!userId // Only run query when userId is available
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
        <h2 className="text-3xl font-bold">Your Posts</h2>
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