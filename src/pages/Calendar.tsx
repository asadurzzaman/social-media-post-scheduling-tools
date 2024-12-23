import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, addDays, eachHourOfInterval, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
  
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfCurrentWeek, i));
  const dayHours = eachHourOfInterval({
    start: startOfDay(currentDate),
    end: endOfDay(currentDate),
  });

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['scheduled-posts', startOfCurrentWeek],
    queryFn: async () => {
      const startDate = startOfCurrentWeek.toISOString();
      const endDate = addDays(startOfCurrentWeek, 7).toISOString();
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .gte('scheduled_for', startDate)
        .lt('scheduled_for', endDate)
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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

        <div className="bg-white rounded-lg border shadow">
          {/* Calendar Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={previousWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <Button
                variant="outline"
                size="icon"
                onClick={nextWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={goToToday}
              >
                Today
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="week">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-auto max-h-[calc(100vh-20rem)]">
            <div className="grid grid-cols-8 divide-x">
              {/* Time Column */}
              <div className="w-20">
                <div className="h-12 border-b"></div> {/* Header spacer */}
                {dayHours.map((hour) => (
                  <div key={hour.toString()} className="h-20 border-b px-2 py-1">
                    <span className="text-sm text-muted-foreground">
                      {format(hour, 'h a')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Days Columns */}
              {weekDays.map((day) => (
                <div key={day.toString()} className="flex-1 min-w-[8rem]">
                  {/* Day Header */}
                  <div className="h-12 border-b p-2 sticky top-0 bg-white">
                    <div className="text-sm font-medium">
                      {format(day, 'EEEE')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(day, 'd')}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {dayHours.map((hour) => {
                    const dayPosts = posts?.filter(post => {
                      const postDate = new Date(post.scheduled_for);
                      return (
                        postDate.getDate() === day.getDate() &&
                        postDate.getHours() === hour.getHours()
                      );
                    });

                    return (
                      <div
                        key={hour.toString()}
                        className="h-20 border-b relative group"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
                          asChild
                        >
                          <Link to="/create-post" className="flex items-center justify-center">
                            <Plus className="h-4 w-4" />
                          </Link>
                        </Button>
                        {dayPosts?.map((post) => (
                          <div
                            key={post.id}
                            className="absolute inset-x-1 top-1 p-1 rounded bg-primary/10 text-primary text-sm"
                          >
                            {post.content.substring(0, 30)}
                            {post.content.length > 30 && '...'}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;