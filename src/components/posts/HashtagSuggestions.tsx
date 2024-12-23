import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface HashtagSuggestionsProps {
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
}

export const HashtagSuggestions = ({ hashtags, onHashtagsChange }: HashtagSuggestionsProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddHashtag = () => {
    if (inputValue.trim() && !hashtags.includes(inputValue.trim())) {
      const newHashtag = inputValue.trim().startsWith('#') 
        ? inputValue.trim() 
        : `#${inputValue.trim()}`;
      onHashtagsChange([...hashtags, newHashtag]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const handleRemoveHashtag = (hashtagToRemove: string) => {
    onHashtagsChange(hashtags.filter(tag => tag !== hashtagToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add hashtag..."
          className="flex-1"
        />
        <Button onClick={handleAddHashtag} type="button">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((hashtag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {hashtag}
            <button
              onClick={() => handleRemoveHashtag(hashtag)}
              className="hover:text-destructive"
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};