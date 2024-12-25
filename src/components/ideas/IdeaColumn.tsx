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
  onDeleteIdea?: (ideaId: string) => void;
  onEditIdea?: (idea: any) => void;
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
  onDeleteIdea,
  onEditIdea,
}) => {
  const columnIdeas = ideas.filter((idea) => idea.status === column.status);
  const isUnassigned = column.status === 'unassigned';

  const handleDragStart = (e: React.DragEvent) => {
    if (isUnassigned) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isUnassigned) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isUnassigned) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    onMove(fromIndex, index);
  };

  return (
    <div 
      className={`bg-[#f2f4f9] rounded-lg p-4 space-y-4 ${!isUnassigned ? 'cursor-move' : ''} relative group h-[calc(100vh-12rem)] flex flex-col`}
      draggable={!isUnassigned}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <IdeaColumnHeader
        title={column.title}
        ideaCount={columnIdeas.length}
        isEditable={!isUnassigned}
        onRename={(newTitle) => onRename({ ...column, title: newTitle })}
        onCreateIdea={onCreateIdea}
        onDelete={!isUnassigned ? () => onDelete(column.id) : undefined}
      />

      <div className="flex-1 overflow-y-auto space-y-4">
        {columnIdeas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onUpdate={onUpdateIdea || (() => {})}
            onDelete={onDeleteIdea}
            onEdit={onEditIdea}
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
    </div>
  );
};