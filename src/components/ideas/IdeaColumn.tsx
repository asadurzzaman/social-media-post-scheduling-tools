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
  onReorderIdeas?: (sourceIndex: number, destinationIndex: number) => void;
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
  onReorderIdeas
}) => {
  const columnIdeas = ideas.filter((idea) => idea.status === column.status);
  const isUnassigned = column.status === 'unassigned';

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex !== dropIndex && onReorderIdeas) {
      onReorderIdeas(dragIndex, dropIndex);
    }
  };

  return (
    <div 
      className="bg-[#f2f4f9] rounded-lg p-4 space-y-4 relative group h-[calc(100vh-12rem)] flex flex-col"
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
        {columnIdeas.map((idea, idx) => (
          <div
            key={idea.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
          >
            <IdeaCard
              idea={idea}
              index={idx}
              onUpdate={onUpdateIdea || (() => {})}
              onDelete={onDeleteIdea}
              onEdit={onEditIdea}
            />
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
    </div>
  );
};