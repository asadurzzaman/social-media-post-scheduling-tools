import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
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
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          toast.error("Authentication error occurred");
          navigate("/auth");
          return;
        }

        if (!session) {
          toast.error("Please sign in to create posts");
          navigate("/auth");
          return;
        }
        
        setUserId(session.user.id);
      } catch (error) {
        console.error("Session error:", error);
        toast.error("Error checking authentication status");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      } else {
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
        .select("*");
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId, // Only fetch if user is authenticated
  });

  const handleSuccess = () => {
    toast.success("Post created successfully!");
    setFormKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Post</h2>
          <p className="text-muted-foreground">Schedule a new social media post</p>
        </div>
        
        {isLoadingAccounts ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-background rounded-lg border">
            <CreatePostForm 
              key={formKey}
              accounts={accounts || []} 
              userId={userId} 
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;