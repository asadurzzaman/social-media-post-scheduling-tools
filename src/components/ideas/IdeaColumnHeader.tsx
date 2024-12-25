import React, { useState } from 'react';
import { Plus, GripHorizontal, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface IdeaColumnHeaderProps {
  title: string;
  ideaCount: number;
  isEditable: boolean;
  onRename: (newTitle: string) => void;
  onCreateIdea: () => void;
  onDelete?: () => void;
}

export const IdeaColumnHeader: React.FC<IdeaColumnHeaderProps> = ({
  title,
  ideaCount,
  isEditable,
  onRename,
  onCreateIdea,
  onDelete,
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

  const handleRenameClick = () => {
    setIsEditing(true);
    setEditedTitle(title);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isEditable && (
          <GripHorizontal className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
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
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onCreateIdea}
        >
          <Plus className="h-4 w-4" />
        </Button>
        {isEditable && onDelete && (
          <ContextMenu>
            <ContextMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-[200px]">
              <ContextMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleRenameClick}
              >
                <Pencil className="h-4 w-4" />
                <div>
                  <span>Rename</span>
                </div>
              </ContextMenuItem>
              <ContextMenuItem
                className="flex items-center gap-2 text-red-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>Delete</span>
                  <span className="text-xs text-gray-500 font-normal">
                    Delete group and move ideas to "Unassigned"
                  </span>
                </div>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
    </div>
  );
};