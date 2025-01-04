import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export const ChatMessage = ({ role, content, isLoading }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 p-4",
      role === 'assistant' ? "bg-muted/50" : "bg-background"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {role === 'user' ? 'U' : 'C'}
        </AvatarFallback>
        {role === 'assistant' && (
          <AvatarImage src="/claude-avatar.png" alt="Claude" />
        )}
      </Avatar>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">
          {role === 'user' ? 'You' : 'Claude'}
        </p>
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-bounce bg-current rounded-full" />
              <div className="h-2 w-2 animate-bounce bg-current rounded-full" style={{ animationDelay: '0.2s' }} />
              <div className="h-2 w-2 animate-bounce bg-current rounded-full" style={{ animationDelay: '0.4s' }} />
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};