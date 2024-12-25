import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColumnHeaderProps {
  title: string;
  status: string;
  itemCount: number;
  isEditing: boolean;
  editedTitle: string;
  onTitleClick: () => void;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onCreateIdea: () => void;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  title,
  status,
  itemCount,
  isEditing,
  editedTitle,
  onTitleClick,
  onTitleChange,
  onTitleBlur,
  onKeyDown,
  onCreateIdea,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={onTitleBlur}
            onKeyDown={onKeyDown}
            className="h-7 w-40"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <h3 
              className="font-medium cursor-pointer hover:text-primary transition-colors"
              onClick={onTitleClick}
            >
              {title}
            </h3>
            <span className="text-sm px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
              {itemCount}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onCreateIdea}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 hover:bg-gray-100"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};