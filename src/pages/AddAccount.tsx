import { DashboardLayout } from "@/components/DashboardLayout";

const AddAccount = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Social Account</h2>
          <p className="text-muted-foreground">Connect your social media accounts</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Account connection feature coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;