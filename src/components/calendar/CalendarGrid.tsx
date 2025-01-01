import { format } from "date-fns";
import { CalendarTimeSlot } from "./CalendarTimeSlot";

interface CalendarGridProps {
  weekDays: Date[];
  dayHours: Date[];
  posts: any[];
  onCreatePost: (date: Date) => void;
  view: 'week' | 'month';
}

export const CalendarGrid = ({ weekDays, dayHours, posts, onCreatePost, view }: CalendarGridProps) => {
  if (view === 'month') {
    return (
      <div className="grid grid-cols-7 divide-x divide-y">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="h-12 p-2 text-sm font-medium bg-gray-50">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {weekDays.map((day) => {
          const dayPosts = posts?.filter(post => {
            const postDate = new Date(post.scheduled_for);
            return (
              postDate.getDate() === day.getDate() &&
              postDate.getMonth() === day.getMonth()
            );
          });

          return (
            <div
              key={day.toString()}
              className="min-h-[8rem] p-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => onCreatePost(day)}
            >
              <div className="text-sm">
                {format(day, 'd')}
              </div>
              <div className="mt-2 space-y-1">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                    title={post.content}
                  >
                    {format(new Date(post.scheduled_for), 'h:mm a')} - {post.content.substring(0, 20)}...
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

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
        {weekDays.slice(0, 7).map((day) => (
          <div key={day.toString()} className="flex-1 min-w-[8rem]">
            <div className="h-12 border-b p-2 sticky top-0 bg-white">
              <div className="text-sm font-medium">
                {format(day, 'EEE')}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(day, 'MMM d')}
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