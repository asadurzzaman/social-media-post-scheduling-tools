import { format } from "date-fns";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { DroppableTimeSlot } from "./DroppableTimeSlot";
import { DraggablePost } from "./DraggablePost";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CalendarGridProps {
  weekDays: Date[];
  dayHours: Date[];
  posts: any[];
  onCreatePost: (date: Date) => void;
  view: 'week' | 'month';
  onPostMove?: (postId: string, newDate: Date) => void;
}

export const CalendarGrid = ({ 
  weekDays, 
  dayHours, 
  posts = [], 
  onCreatePost, 
  view,
  onPostMove 
}: CalendarGridProps) => {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const postId = active.id as string;
    const newDate = new Date(over.id as string);

    try {
      const { error } = await supabase
        .from('posts')
        .update({ scheduled_for: newDate.toISOString() })
        .eq('id', postId);

      if (error) throw error;

      onPostMove?.(postId, newDate);
      toast.success("Post rescheduled successfully");
    } catch (error) {
      console.error("Error moving post:", error);
      toast.error("Failed to reschedule post");
    }
  };

  if (view === 'month') {
    return (
      <DndContext onDragEnd={handleDragEnd}>
        <div className="overflow-auto">
          <div className="grid grid-cols-7 divide-x">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="h-12 border-b sticky top-0 bg-white">
                <div className="text-sm font-medium">
                  {day}
                </div>
              </div>
            ))}
            
            {weekDays.map((day) => {
              const dayPosts = posts?.filter(post => {
                if (!post?.scheduled_for) return false;
                const postDate = new Date(post.scheduled_for);
                return (
                  postDate.getDate() === day.getDate() &&
                  postDate.getMonth() === day.getMonth()
                );
              }) || [];

              return (
                <div
                  key={day.toString()}
                  className="min-h-[8rem] relative group hover:bg-gray-50"
                >
                  <div>
                    <div className="text-sm">
                      {format(day, 'd')}
                    </div>
                    <div className="mt-2 space-y-1">
                      {dayPosts.map((post) => (
                        <DraggablePost key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                  <button
                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/5"
                    onClick={() => onCreatePost(day)}
                  >
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <Plus className="h-4 w-4" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </DndContext>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="overflow-auto max-h-[calc(100vh-20rem)]">
        <div className="grid grid-cols-8 divide-x">
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

          {weekDays.slice(0, 7).map((day) => (
            <div key={day.toString()} className="flex-1 min-w-[8rem]">
              <div className="h-12 border-b sticky top-0 bg-white">
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
                
                const slotPosts = posts?.filter(post => {
                  if (!post?.scheduled_for) return false;
                  const postDate = new Date(post.scheduled_for);
                  return (
                    postDate.getDate() === day.getDate() &&
                    postDate.getHours() === hour.getHours()
                  );
                }) || [];

                return (
                  <DroppableTimeSlot
                    key={hour.toString()}
                    hour={slotDate}
                    posts={slotPosts}
                    onCreatePost={onCreatePost}
                  >
                    {slotPosts.map((post) => (
                      <DraggablePost 
                        key={post.id} 
                        post={post}
                        className="absolute inset-x-1 top-1" 
                      />
                    ))}
                  </DroppableTimeSlot>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
};