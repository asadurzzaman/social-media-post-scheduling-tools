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

const demoMentions = [
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
  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <span ref={triggerRef} className="fixed" />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]" sideOffset={5}>
        <Command>
          <Command.List>
            {demoMentions.map((mention) => (
              <Command.Item
                key={mention}
                onSelect={() => {
                  onSelect(mention);
                  onClose();
                }}
                className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                value={mention}
              >
                {mention}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
};