import { useDraggable } from "@dnd-kit/core";
import { format } from "date-fns";
import { CSS } from "@dnd-kit/utilities";

interface DraggablePostProps {
  post: any;
  className?: string;
}

export const DraggablePost = ({ post, className = "" }: DraggablePostProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: post.id,
    data: post,
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-move p-1 rounded bg-primary/10 text-primary text-sm truncate ${className}`}
      title={post.content}
    >
      {format(new Date(post.scheduled_for), 'h:mm a')} - {post.content.substring(0, 20)}
      {post.content.length > 20 && '...'}
    </div>
  );
};