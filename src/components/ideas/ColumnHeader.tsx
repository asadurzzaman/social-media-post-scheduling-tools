import React, { useState } from 'react';
import { Plus, GripHorizontal } from 'lucide-react';
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
        <GripHorizontal className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <h3 
            className="font-semibold cursor-pointer hover:text-primary transition-colors"
            onClick={onTitleClick}
          >
            {title}
          </h3>
        )}
        <span className="text-sm px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
          {itemCount}
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onCreateIdea}
        className="hover:bg-primary/10 hover:text-primary"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};