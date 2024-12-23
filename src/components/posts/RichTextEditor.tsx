import React from 'react';
import { cn } from "@/lib/utils";
import { HashtagSuggestions } from './HashtagSuggestions';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  hashtags?: string[];
  onHashtagsChange?: (hashtags: string[]) => void;
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  maxLength = 2200,
  hashtags = [],
  onHashtagsChange = () => {}
}: RichTextEditorProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="min-h-[200px] border rounded-md overflow-hidden">
          <textarea
            value={value}
            onChange={handleChange}
            className={cn(
              "w-full h-[200px] p-3 resize-none focus:outline-none",
              "placeholder:text-muted-foreground"
            )}
            placeholder="Write your post content here..."
          />
        </div>
        <div className="flex justify-end text-sm text-muted-foreground">
          <span>{value.length}/{maxLength}</span>
        </div>
      </div>
      <HashtagSuggestions 
        hashtags={hashtags}
        onHashtagsChange={onHashtagsChange}
      />
    </div>
  );
};