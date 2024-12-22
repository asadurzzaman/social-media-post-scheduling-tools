import { DashboardLayout } from "@/components/DashboardLayout";

const CreatePost = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Post</h2>
          <p className="text-muted-foreground">Create and schedule new social media posts</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Post creation feature coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;