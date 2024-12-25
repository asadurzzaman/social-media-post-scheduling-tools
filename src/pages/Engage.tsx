import { DashboardLayout } from "@/components/DashboardLayout";

const Engage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Engage</h2>
          <p className="text-muted-foreground">
            Interact with your audience and manage conversations
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Engagement features coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Engage;