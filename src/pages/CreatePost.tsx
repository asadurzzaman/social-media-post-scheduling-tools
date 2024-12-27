import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePostForm } from "@/components/posts/CreatePostForm";
import { toast } from "sonner";

const CreatePost = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSuccess = () => {
    toast.success("Post created successfully!");
    // Force a complete remount of the form component
    setFormKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Post</h2>
          <p className="text-muted-foreground">Schedule a new social media post</p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <CreatePostForm 
            key={formKey}
            accounts={accounts || []} 
            userId={userId} 
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;