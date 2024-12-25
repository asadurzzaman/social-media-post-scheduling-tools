import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IdeaColumnHeader } from './IdeaColumnHeader';
import { IdeaCard } from './IdeaCard';

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
  onUpdateIdea?: (ideaId: string, updates: any) => void;
}

export const IdeaColumn: React.FC<IdeaColumnProps> = ({
  column,
  ideas,
  index,
  onRename,
  onDelete,
  onMove,
  onCreateIdea,
  onUpdateIdea,
}) => {
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

  return (
    <div 
      className="bg-[#f2f4f9] rounded-lg p-4 space-y-4 cursor-move relative group"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <IdeaColumnHeader
        title={column.title}
        ideaCount={columnIdeas.length}
        isEditable={column.status !== 'unassigned'}
        onRename={(newTitle) => onRename({ ...column, title: newTitle })}
        onCreateIdea={onCreateIdea}
      />

      {columnIdeas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onUpdate={onUpdateIdea || (() => {})}
        />
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