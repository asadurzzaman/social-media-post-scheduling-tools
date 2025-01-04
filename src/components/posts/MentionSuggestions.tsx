import { Command } from "cmdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MentionSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mention: string) => void;
  triggerRef: React.RefObject<HTMLSpanElement>;
}

// Define mentions outside component to avoid recreating on each render
const DEFAULT_MENTIONS = [
  "@john.doe",
  "@jane.smith",
  "@marketing.team",
  "@sales.dept",
  "@support.team",
];

export const MentionSuggestions = ({
  isOpen,
  onClose,
  onSelect,
  triggerRef,
}: MentionSuggestionsProps) => {
  // Ensure we always have a valid array to map over
  const mentions = DEFAULT_MENTIONS || [];

  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <span ref={triggerRef} className="fixed" />
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[200px]" 
        sideOffset={5}
        align="start"
        side="bottom"
      >
        <Command>
          <Command.List>
            {mentions.length > 0 ? (
              mentions.map((mention) => (
                <Command.Item
                  key={mention}
                  value={mention}
                  onSelect={() => {
                    onSelect(mention);
                    onClose();
                  }}
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                >
                  {mention}
                </Command.Item>
              ))
            ) : (
              <Command.Item
                value="no-mentions"
                className="px-2 py-1.5 text-sm text-muted-foreground"
                disabled
              >
                No mentions available
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
};