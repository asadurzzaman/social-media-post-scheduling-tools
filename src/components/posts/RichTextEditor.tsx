import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Link, Hash, AtSign } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export const RichTextEditor = ({ value, onChange, maxLength = 2200 }: RichTextEditorProps) => {
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (start === end) return; // No text selected

    let newText = value;
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        cursorOffset = 4;
        break;
      case 'italic':
        newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
        cursorOffset = 2;
        break;
      case 'list':
        newText = value.substring(0, start) + `\n- ${selectedText}` + value.substring(end);
        cursorOffset = 3;
        break;
      case 'link':
        newText = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end);
        cursorOffset = 7;
        break;
      case 'hashtag':
        newText = value.substring(0, start) + `#${selectedText}` + value.substring(end);
        cursorOffset = 1;
        break;
      case 'mention':
        newText = value.substring(0, start) + `@${selectedText}` + value.substring(end);
        cursorOffset = 1;
        break;
    }

    onChange(newText);

    // Restore cursor position after state update
    setTimeout(() => {
      textarea.focus();
      const newPosition = end + cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('list')}
          className="h-8 w-8 p-0"
          title="List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('link')}
          className="h-8 w-8 p-0"
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('hashtag')}
          className="h-8 w-8 p-0"
          title="Hashtag"
        >
          <Hash className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('mention')}
          className="h-8 w-8 p-0"
          title="Mention"
        >
          <AtSign className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          if (!maxLength || e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        placeholder="Write your post content here..."
        className="min-h-[150px]"
      />
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {value.split('#').length > 1 && (
            <span className="mr-2">
              {value.split('#').length - 1} hashtags
            </span>
          )}
          {value.split('@').length > 1 && (
            <span>
              {value.split('@').length - 1} mentions
            </span>
          )}
        </span>
        <span>{charCount}/{maxLength}</span>
      </div>
    </div>
  );
};