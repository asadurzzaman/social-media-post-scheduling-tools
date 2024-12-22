import { DashboardLayout } from "@/components/DashboardLayout";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Track your social media performance</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Analytics feature coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;