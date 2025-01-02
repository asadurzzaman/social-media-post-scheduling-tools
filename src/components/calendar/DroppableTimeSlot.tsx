import { useDroppable } from "@dnd-kit/core";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DroppableTimeSlotProps {
  hour: Date;
  posts: any[];
  onCreatePost: (date: Date) => void;
  children?: React.ReactNode;
}

export const DroppableTimeSlot = ({ 
  hour, 
  posts, 
  onCreatePost,
  children 
}: DroppableTimeSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: hour.toISOString(),
    data: { date: hour },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`h-20 border-b relative group ${isOver ? 'bg-primary/5' : ''}`}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
        onClick={() => onCreatePost(hour)}
      >
        <Plus className="h-4 w-4" />
      </Button>
      {children}
    </div>
  );
};