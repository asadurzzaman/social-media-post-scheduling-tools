import { DashboardLayout } from "@/components/DashboardLayout";

const Compose = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compose</h2>
          <p className="text-muted-foreground">Create and schedule your social media posts</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Compose feature coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Compose;