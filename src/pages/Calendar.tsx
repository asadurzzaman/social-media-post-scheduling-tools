import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";

const Calendar = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['scheduled-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getDayPosts = (date: Date) => {
    if (!posts) return [];
    return posts.filter(post => {
      const postDate = new Date(post.scheduled_for);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">View and manage your content schedule</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[350px,1fr] gap-6">
          <Card className="p-4">
            <CalendarComponent
              mode="single"
              className="rounded-md border"
              modifiers={{
                booked: (date) => getDayPosts(date).length > 0,
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: 'bold',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: '4px',
                }
              }}
            />
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scheduled Posts</h3>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                    >
                      <CalendarClock className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(post.scheduled_for), "PPP 'at' p")}
                        </p>
                        <p className="text-sm">{post.content}</p>
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt="Post preview"
                            className="mt-2 rounded-md max-w-[200px] h-auto"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No scheduled posts found.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;