import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, MessageSquare, Star, Plus, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: posts } = await supabase
        .from('posts')
        .select('*');
      
      const { data: accounts } = await supabase
        .from('social_accounts')
        .select('*');

      return [
        {
          title: "Total Posts",
          value: posts?.length || "0",
          icon: <Star className="h-4 w-4" />,
        },
        {
          title: "Connected Accounts",
          value: accounts?.length || "0",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Scheduled Posts",
          value: posts?.filter(p => p.status === 'scheduled').length || "0",
          icon: <Clock className="h-4 w-4" />,
        },
        {
          title: "Pending Posts",
          value: posts?.filter(p => p.status === 'pending').length || "0",
          icon: <MessageSquare className="h-4 w-4" />,
        },
      ];
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['recent-projects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('idea_groups')
        .select('*')
        .limit(2)
        .order('created_at', { ascending: false });
      
      return data?.map(group => ({
        title: group.name,
        progress: 75, // This could be calculated based on completed ideas
        users: ["user1.jpg", "user2.jpg"],
        date: new Date(group.created_at).toLocaleDateString(),
      })) || [];
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back to your dashboard
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats?.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <ActivityChart />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Recent Projects</span>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects?.map((project, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{project.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {project.users.map((user, j) => (
                        <Avatar key={j} className="h-6 w-6 border-2 border-background">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {project.progress}%
                      </span>
                      <div className="h-2 w-20 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {project.date}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;