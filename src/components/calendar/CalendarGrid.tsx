import { format } from "date-fns";
import { CalendarTimeSlot } from "./CalendarTimeSlot";

interface CalendarGridProps {
  weekDays: Date[];
  dayHours: Date[];
  posts: any[];
  onCreatePost: (date: Date) => void;
}

export const CalendarGrid = ({ weekDays, dayHours, posts, onCreatePost }: CalendarGridProps) => {
  return (
    <div className="overflow-auto max-h-[calc(100vh-20rem)]">
      <div className="grid grid-cols-8 divide-x">
        {/* Time Column */}
        <div className="w-20">
          <div className="h-12 border-b"></div>
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
            <div className="h-12 border-b p-2 sticky top-0 bg-white">
              <div className="text-sm font-medium">
                {format(day, 'EEEE')}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(day, 'd')}
              </div>
            </div>

            {dayHours.map((hour) => {
              const slotDate = new Date(day);
              slotDate.setHours(hour.getHours(), 0, 0, 0);
              
              const dayPosts = posts?.filter(post => {
                const postDate = new Date(post.scheduled_for);
                return (
                  postDate.getDate() === day.getDate() &&
                  postDate.getHours() === hour.getHours()
                );
              });

              return (
                <CalendarTimeSlot
                  key={hour.toString()}
                  hour={slotDate}
                  posts={dayPosts}
                  onCreatePost={onCreatePost}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};