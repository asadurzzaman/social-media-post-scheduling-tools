import { format } from "date-fns";
import { CalendarTimeSlot } from "./CalendarTimeSlot";
import { Plus } from "lucide-react";

interface CalendarGridProps {
  weekDays: Date[];
  dayHours: Date[];
  posts: any[];
  onCreatePost: (date: Date) => void;
  view: 'week' | 'month';
}

export const CalendarGrid = ({ weekDays, dayHours, posts = [], onCreatePost, view }: CalendarGridProps) => {
  if (view === 'month') {
    return (
      <div className="overflow-auto">
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
                  if (!post?.scheduled_for) return false;
                  const postDate = new Date(post.scheduled_for);
                  return (
                    postDate.getDate() === day.getDate() &&
                    postDate.getMonth() === day.getMonth() &&
                    postDate.getHours() === hour.getHours()
                  );
                }) || [];

                return (
                  <div
                    key={hour.toString()}
                    className="h-20 border-b relative group"
                  >
                    <div className="absolute inset-1">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-1 text-sm bg-primary/10 text-primary rounded mb-1 truncate"
                        >
                          {post.content}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => onCreatePost(slotDate)}
                      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center justify-center w-full h-full bg-primary/5">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
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
                if (!post?.scheduled_for) return false;
                const postDate = new Date(post.scheduled_for);
                return (
                  postDate.getDate() === day.getDate() &&
                  postDate.getHours() === hour.getHours()
                );
              }) || [];

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