import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent } from "@/components/ui/popover";

interface MentionSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mention: string) => void;
  triggerRef: React.RefObject<HTMLSpanElement>;
}

const suggestions = [
  "@everyone",
  "@team",
  "@marketing",
  "@sales",
  "@engineering",
  "@design",
];

export const MentionSuggestions = ({
  isOpen,
  onClose,
  onSelect,
  triggerRef,
}: MentionSuggestionsProps) => {
  return (
    <span ref={triggerRef} className="absolute">
      <Popover open={isOpen} onOpenChange={onClose}>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search mentions..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => {
                      onSelect(suggestion);
                      onClose();
                    }}
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </span>
  );
};