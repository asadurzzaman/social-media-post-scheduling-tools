import { useState, useEffect } from "react";
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

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleFormat = (format: string) => {
    let newText = value;
    const selection = window.getSelection();
    if (!selection || !selection.toString()) return;

    const selectedText = selection.toString();
    switch (format) {
      case 'bold':
        newText = value.replace(selectedText, `**${selectedText}**`);
        break;
      case 'italic':
        newText = value.replace(selectedText, `*${selectedText}*`);
        break;
      case 'list':
        newText = value.replace(selectedText, `\n- ${selectedText}`);
        break;
      case 'link':
        newText = value.replace(selectedText, `[${selectedText}](url)`);
        break;
      case 'hashtag':
        newText = value.replace(selectedText, `#${selectedText}`);
        break;
      case 'mention':
        newText = value.replace(selectedText, `@${selectedText}`);
        break;
    }
    onChange(newText);
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
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('list')}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('link')}
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('hashtag')}
          className="h-8 w-8 p-0"
        >
          <Hash className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('mention')}
          className="h-8 w-8 p-0"
        >
          <AtSign className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
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