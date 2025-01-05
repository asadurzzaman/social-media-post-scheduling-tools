import React, { useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { MentionSuggestions } from './MentionSuggestions';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  maxLength = 2200
}: RichTextEditorProps) => {
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const value = textarea.value;
    const cursorPos = textarea.selectionStart;
    setCursorPosition(cursorPos);

    // Check if we should show mentions
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    const hasSpaceAfterAt = textBeforeCursor.slice(lastAtSymbol + 1).includes(' ');
    
    if (lastAtSymbol !== -1 && !hasSpaceAfterAt && lastAtSymbol === textBeforeCursor.length - 1) {
      setShowMentions(true);
      // Update trigger position to match cursor
      if (triggerRef.current && textareaRef.current) {
        const { offsetLeft, offsetTop } = textareaRef.current;
        const textBeforeCursor = value.slice(0, cursorPos);
        const dummySpan = document.createElement('span');
        dummySpan.style.font = window.getComputedStyle(textareaRef.current).font;
        dummySpan.textContent = textBeforeCursor;
        document.body.appendChild(dummySpan);
        const textWidth = dummySpan.offsetWidth;
        document.body.removeChild(dummySpan);
        
        triggerRef.current.style.left = `${offsetLeft + textWidth}px`;
        triggerRef.current.style.top = `${offsetTop}px`;
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (mention: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const textBeforeMention = value.slice(0, cursorPosition);
      const textAfterMention = value.slice(cursorPosition);
      
      // Remove the @ symbol we typed and add the mention
      const newText = textBeforeMention.slice(0, -1) + mention + ' ' + textAfterMention;
      
      if (!maxLength || newText.length <= maxLength) {
        onChange(newText);
        // Move cursor after the mention
        setTimeout(() => {
          const newCursorPos = textBeforeMention.length - 1 + mention.length + 1;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }, 0);
      }
    }
    setShowMentions(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="min-h-[200px] border rounded-md overflow-hidden relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            className={cn(
              "w-full h-[200px] p-3 resize-none focus:outline-none",
              "placeholder:text-muted-foreground"
            )}
            placeholder="Write your post content here... Use @ to mention"
          />
          <MentionSuggestions
            isOpen={showMentions}
            onClose={() => setShowMentions(false)}
            onSelect={handleMentionSelect}
            triggerRef={triggerRef}
          />
        </div>
        <div className="flex justify-end text-sm text-muted-foreground">
          <span>{value.length}/{maxLength}</span>
        </div>
      </div>
    </div>
  );
};