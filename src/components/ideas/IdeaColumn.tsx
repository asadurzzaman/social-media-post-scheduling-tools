import React, { useState } from 'react';
import { Plus, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface IdeaColumnProps {
  column: {
    id: string;
    title: string;
    status: string;
  };
  ideas: any[];
  index: number;
  onRename: (column: any) => void;
  onDelete: (columnId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onCreateIdea: () => void;
}

export const IdeaColumn: React.FC<IdeaColumnProps> = ({
  column,
  ideas,
  index,
  onRename,
  onDelete,
  onMove,
  onCreateIdea,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);
  const columnIdeas = ideas.filter((idea) => idea.status === column.status);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    onMove(fromIndex, index);
  };

  const handleTitleClick = () => {
    if (column.status !== 'unassigned') {
      setIsEditing(true);
    }
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() !== '') {
      onRename({ ...column, title: editedTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(column.title);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className="bg-background rounded-lg p-4 space-y-4 border border-gray-100 cursor-move relative group"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              className="h-7 w-40"
              autoFocus
            />
          ) : (
            <h3 
              className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleTitleClick}
            >
              {column.title}
            </h3>
          )}
          <span className="text-sm text-muted-foreground">
            {columnIdeas.length}
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

      {columnIdeas.map((idea, ideaIndex) => (
        <div
          key={ideaIndex}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
        >
          <h4 className="font-medium">{idea.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {idea.content}
          </p>
        </div>
      ))}

      {columnIdeas.length === 0 && (
        <Button
          variant="ghost"
          className="w-full h-24 border-2 border-dashed border-gray-200 hover:border-gray-300"
          onClick={onCreateIdea}
        >
          <Plus className="h-4 w-4 mr-2" /> New Idea
        </Button>
      )}
    </div>
  );
};