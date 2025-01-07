import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePostForm } from "@/components/posts/CreatePostForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          toast.error("Please sign in to continue");
          navigate("/auth");
          return;
        }

        setUserId(session.user.id);
      } catch (error: any) {
        console.error("Auth error:", error);
        toast.error("Authentication error. Please try signing in again.");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (session) {
        setUserId(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("platform", "facebook");
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId, // Only fetch if we have a userId
  });

  const handleSuccess = () => {
    toast.success("Post created successfully!");
    setFormKey(prev => prev + 1);
  };

  if (isLoading || isLoadingAccounts) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Create Post</h2>
          <p className="text-muted-foreground mt-2">Schedule a new social media post</p>
        </div>
        
        <CreatePostForm 
          key={formKey}
          accounts={accounts || []} 
          userId={userId} 
          onSuccess={handleSuccess}
        />
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;