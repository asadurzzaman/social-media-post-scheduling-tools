import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface CalendarTimeSlotProps {
  hour: Date;
  posts: any[];
  onCreatePost: (date: Date) => void;
}

export const CalendarTimeSlot = ({ hour, posts, onCreatePost }: CalendarTimeSlotProps) => {
  return (
    <div className="h-20 border-b relative group">
      <Button
        variant="ghost"
        size="sm"
        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
        onClick={() => onCreatePost(hour)}
      >
        <Plus className="h-4 w-4" />
      </Button>
      {posts?.map((post) => (
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
};