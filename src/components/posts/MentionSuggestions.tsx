import React, { useEffect, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
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

const SUGGESTIONS = [
  "@john_doe",
  "@jane_smith",
  "@social_media_expert",
  "@content_creator",
  "@marketing_guru"
];

export const MentionSuggestions = ({
  isOpen,
  onClose,
  onSelect,
  triggerRef
}: MentionSuggestionsProps) => {
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const filteredSuggestions = SUGGESTIONS.filter(suggestion =>
    suggestion.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverTrigger asChild>
        <span ref={triggerRef} className="absolute" />
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        sideOffset={5}
        align="start"
      >
        <Command value={searchValue} onValueChange={setSearchValue}>
          <CommandInput placeholder="Search mentions..." />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {filteredSuggestions.map((suggestion) => (
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
        </Command>
      </PopoverContent>
    </Popover>
  );
};