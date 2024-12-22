import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { Users, MessageSquare, Heart, BarChart2 } from "lucide-react";

const Index = () => {
  const analyticsData = [
    {
      title: "Total Followers",
      value: "12,345",
      icon: <Users className="h-4 w-4 text-primary" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Engagement Rate",
      value: "4.2%",
      icon: <Heart className="h-4 w-4 text-primary" />,
      trend: { value: 0.5, isPositive: true },
    },
    {
      title: "Total Posts",
      value: "286",
      icon: <MessageSquare className="h-4 w-4 text-primary" />,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Avg. Reach",
      value: "2,890",
      icon: <BarChart2 className="h-4 w-4 text-primary" />,
      trend: { value: 3, isPositive: false },
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Your social media performance at a glance
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {analyticsData.map((data, index) => (
            <AnalyticsCard key={index} {...data} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Recent Posts</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">No posts yet</p>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Upcoming Schedule</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">No scheduled posts</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;