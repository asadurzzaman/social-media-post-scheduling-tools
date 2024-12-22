import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const { data: posts, isLoading, refetch } = useQuery({
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

  const goToToday = () => {
    const today = new Date();
    setDate(today);
    setMonth(today);
  };

  const previousMonth = () => {
    setMonth(new Date(month.setMonth(month.getMonth() - 1)));
  };

  const nextMonth = () => {
    setMonth(new Date(month.setMonth(month.getMonth() + 1)));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
            <p className="text-muted-foreground">View and manage your content schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/create-post" className="gap-2">
                <Plus className="h-4 w-4" />
                New post
              </Link>
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {format(month, 'MMMM yyyy')}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>

          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonth}
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
            showOutsideDays
            fixedWeeks
          />

          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Scheduled Posts for {format(date, 'MMMM d, yyyy')}</h4>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {getDayPosts(date).map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {format(new Date(post.scheduled_for), 'p')}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {post.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{post.content}</p>
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
                {getDayPosts(date).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No posts scheduled for this day
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;