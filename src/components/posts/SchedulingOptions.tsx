import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";

interface SchedulingOptionsProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  onTimezoneChange: (timezone: string) => void;
}

export const SchedulingOptions = ({
  date,
  onDateChange,
  onTimezoneChange,
}: SchedulingOptionsProps) => {
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserTimezone = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('id', user.id)
          .single();
        
        if (profile?.timezone) {
          setUserTimezone(profile.timezone);
          onTimezoneChange(profile.timezone);
        } else {
          // Default to browser's timezone if user hasn't set one
          const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setUserTimezone(browserTimezone);
          onTimezoneChange(browserTimezone);
        }
      }
      setLoading(false);
    };

    loadUserTimezone();
  }, []);

  if (loading) {
    return <div>Loading timezone settings...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          Schedule Date & Time <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mt-1.5">
          <DatePicker date={date} onDateChange={onDateChange} />
          <TimePicker date={date} onTimeChange={(timeString) => {
            if (!date) return;
            
            // Convert 12-hour format to 24-hour for internal handling
            const [time, period] = timeString.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'PM' && hours !== 12) {
              hours += 12;
            } else if (period === 'AM' && hours === 12) {
              hours = 0;
            }
            
            const newDate = new Date(date);
            newDate.setHours(hours, minutes);
            onDateChange(newDate);
          }} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Times are shown in {userTimezone}. You can change your timezone in your profile settings.
      </p>
    </div>
  );
};