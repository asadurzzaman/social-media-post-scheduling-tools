import { DashboardLayout } from "@/components/DashboardLayout";

const Calendar = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">View and manage your content schedule</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Calendar feature coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;