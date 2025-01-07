import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { toast } from "sonner";

const Posts = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
  });

  const transformPost = (post: any): Post => ({
    id: post.id,
    content: post.content,
    status: post.status || 'draft',
    created_at: post.created_at,
    scheduled_for: post.scheduled_for,
    hashtags: post.hashtags || [],
    social_account_id: post.social_account_id,
    timezone: post.timezone || 'UTC',
    user_id: post.user_id,
    group_id: post.group_id,
    search_vector: post.search_vector,
    social_accounts: {
      platform: post.social_accounts?.platform
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-3xl font-bold">Your Posts</h2>
        <div>
          {posts?.map(post => (
            <div key={post.id}>
              <h3>{post.content}</h3>
              <p>Status: {post.status}</p>
              <p>Scheduled for: {post.scheduled_for}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Posts;