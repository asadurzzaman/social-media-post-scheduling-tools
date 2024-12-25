import { DashboardLayout } from "@/components/DashboardLayout";
import { IdeaManager } from "@/components/ideas/IdeaManager";

const Compose = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create Idea</h2>
          </div>
        </div>

        <IdeaManager />
      </div>
    </DashboardLayout>
  );
};

export default Compose;