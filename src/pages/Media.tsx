import { DashboardLayout } from "@/components/DashboardLayout";

const Media = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground">Manage your media assets</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Media library feature coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Media;