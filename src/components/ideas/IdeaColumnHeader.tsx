import React, { useState } from 'react';
import { Plus, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface IdeaColumnHeaderProps {
  title: string;
  ideaCount: number;
  isEditable: boolean;
  onRename: (newTitle: string) => void;
  onCreateIdea: () => void;
}

export const IdeaColumnHeader: React.FC<IdeaColumnHeaderProps> = ({
  title,
  ideaCount,
  isEditable,
  onRename,
  onCreateIdea,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleClick = () => {
    if (isEditable) {
      setIsEditing(true);
      setEditedTitle(title);
    }
  };

  const handleTitleBlur = () => {
    if (editedTitle.trim() !== '') {
      onRename(editedTitle.trim());
    } else {
      setEditedTitle(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <GripHorizontal className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            className="h-7 w-40"
            autoFocus
          />
        ) : (
          <h3 
            className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleTitleClick}
          >
            {title}
          </h3>
        )}
        <span className="text-sm text-muted-foreground">
          {ideaCount}
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onCreateIdea}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};