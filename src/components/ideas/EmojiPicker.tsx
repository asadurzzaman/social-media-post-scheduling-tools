import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[352px]" side="right">
        <Picker 
          data={data}
          onEmojiSelect={onEmojiSelect}
          theme="light"
          set="native"
          previewPosition="none"
          skinTonePosition="none"
          navPosition="none"
          perLine={8}
        />
      </PopoverContent>
    </Popover>
  );
}