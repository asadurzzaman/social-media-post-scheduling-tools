import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, startOfMonth, addDays, eachHourOfInterval, startOfDay, endOfDay, endOfMonth, addMonths } from "date-fns";
import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CreatePostDialog } from "@/components/calendar/CreatePostDialog";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  
  const startDate = view === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 0 })
    : view === 'month'
    ? startOfMonth(currentDate)
    : startOfDay(currentDate);
  
  const endDate = view === 'week'
    ? addDays(startDate, 7)
    : view === 'month'
    ? endOfMonth(currentDate)
    : endOfDay(currentDate);
  
  const weekDays = view === 'week'
    ? [...Array(7)].map((_, i) => addDays(startDate, i))
    : view === 'month'
    ? [...Array(35)].map((_, i) => addDays(startDate, i))
    : [currentDate];
  
  const dayHours = eachHourOfInterval({
    start: startOfDay(currentDate),
    end: endOfDay(currentDate),
  });

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['scheduled-posts', startDate, view],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .gte('scheduled_for', startDate.toISOString())
        .lt('scheduled_for', endDate.toISOString())
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: accounts } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  const previousPeriod = () => {
    if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else if (view === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const nextPeriod = () => {
    if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreatePost = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseDialog = () => {
    setSelectedDate(null);
  };

  const handleViewChange = (newView: string) => {
    setView(newView as 'day' | 'week' | 'month');
  };

  return (
    <DashboardLayout>
      <CalendarHeader
        currentDate={currentDate}
        onPreviousWeek={previousPeriod}
        onNextWeek={nextPeriod}
        onToday={goToToday}
        onRefresh={refetch}
        view={view}
        onViewChange={handleViewChange}
      />

      <div className="bg-white rounded-lg border shadow">
        <CalendarGrid
          weekDays={weekDays}
          dayHours={dayHours}
          posts={posts}
          onCreatePost={handleCreatePost}
          view={view}
          onPostMove={(postId, newDate) => {
            if (postId === "refresh") {
              refetch();
            }
          }}
        />
      </div>

      <CreatePostDialog
        isOpen={selectedDate !== null}
        onClose={handleCloseDialog}
        selectedDate={selectedDate}
        accounts={accounts || []}
        userId={null}
      />
    </DashboardLayout>
  );
};

export default Calendar;