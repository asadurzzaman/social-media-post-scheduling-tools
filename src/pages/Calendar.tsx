import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addDays, eachHourOfInterval, startOfDay, endOfDay } from "date-fns";
import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CreatePostDialog } from "@/components/calendar/CreatePostDialog";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
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

  return (
    <DashboardLayout>
      <CalendarHeader
        currentDate={currentDate}
        onPreviousWeek={previousWeek}
        onNextWeek={nextWeek}
        onToday={goToToday}
        onRefresh={refetch}
      />

      <div className="bg-white rounded-lg border shadow">
        <CalendarGrid
          weekDays={weekDays}
          dayHours={dayHours}
          posts={posts}
          onCreatePost={handleCreatePost}
        />
      </div>

      <CreatePostDialog
        isOpen={selectedDate !== null}
        onClose={handleCloseDialog}
        selectedDate={selectedDate}
        accounts={accounts || []}
        userId={null} // TODO: Get actual user ID
      />
    </DashboardLayout>
  );
};

export default Calendar;
