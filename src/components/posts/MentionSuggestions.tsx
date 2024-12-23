import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MentionSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const SAMPLE_MENTIONS = [
  "@social_media_tips",
  "@marketing_guru",
  "@content_creator",
  "@digital_marketer",
  "@brand_builder"
];

export const MentionSuggestions = ({ 
  isOpen, 
  onClose, 
  onSelect,
  triggerRef 
}: MentionSuggestionsProps) => {
  const [searchValue, setSearchValue] = useState("");

  const filteredMentions = SAMPLE_MENTIONS.filter(mention =>
    mention.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverTrigger asChild>
        <span ref={triggerRef as React.RefObject<HTMLSpanElement>} />
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
        <Command value={searchValue} onValueChange={setSearchValue}>
          <CommandInput placeholder="Search mentions..." />
          <CommandEmpty>No mentions found.</CommandEmpty>
          <CommandGroup>
            {filteredMentions.map((mention) => (
              <CommandItem
                key={mention}
                value={mention}
                onSelect={() => {
                  onSelect(mention);
                  onClose();
                }}
              >
                {mention}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};