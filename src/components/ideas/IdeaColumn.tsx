import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColumnHeader } from './ColumnHeader';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editingIdeaTitle, setEditingIdeaTitle] = useState("");
  const [editingIdeaContent, setEditingIdeaContent] = useState("");
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
      setEditedTitle(column.title);
    }
  };

  const handleTitleBlur = () => {
    if (editedTitle.trim() !== '') {
      onRename({ ...column, title: editedTitle.trim() });
    } else {
      setEditedTitle(column.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'column' | 'idea') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'column') {
        handleTitleBlur();
      } else {
        handleIdeaBlur();
      }
    } else if (e.key === 'Escape') {
      if (type === 'column') {
        setEditedTitle(column.title);
        setIsEditing(false);
      } else {
        setEditingIdeaId(null);
        setEditingIdeaTitle("");
        setEditingIdeaContent("");
      }
    }
  };

  const handleIdeaBlur = () => {
    if (editingIdeaId && onUpdateIdea) {
      const updates: any = {};
      if (editingIdeaTitle.trim() !== '') {
        updates.title = editingIdeaTitle.trim();
      }
      if (editingIdeaContent.trim() !== '') {
        updates.content = editingIdeaContent.trim();
      }
      if (Object.keys(updates).length > 0) {
        onUpdateIdea(editingIdeaId, updates);
      }
    }
    setEditingIdeaId(null);
    setEditingIdeaTitle("");
    setEditingIdeaContent("");
  };

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100
                hover:shadow-md transition-all duration-200 cursor-move
                w-[350px] min-h-[calc(100vh-120px)] flex flex-col"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ColumnHeader
        title={column.title}
        status={column.status}
        itemCount={columnIdeas.length}
        isEditing={isEditing}
        editedTitle={editedTitle}
        onTitleClick={handleTitleClick}
        onTitleChange={setEditedTitle}
        onTitleBlur={handleTitleBlur}
        onKeyDown={(e) => handleKeyDown(e, 'column')}
        onCreateIdea={onCreateIdea}
      />

      <div className="flex-1 space-y-2">
        {columnIdeas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            isEditing={editingIdeaId === idea.id}
            editingTitle={editingIdeaTitle}
            editingContent={editingIdeaContent}
            onTitleClick={() => {
              setEditingIdeaId(idea.id);
              setEditingIdeaTitle(idea.title);
              setEditingIdeaContent(idea.content);
            }}
            onContentClick={() => {
              setEditingIdeaId(idea.id);
              setEditingIdeaTitle(idea.title);
              setEditingIdeaContent(idea.content);
            }}
            onTitleChange={setEditingIdeaTitle}
            onContentChange={setEditingIdeaContent}
            onBlur={handleIdeaBlur}
            onKeyDown={(e) => handleKeyDown(e, 'idea')}
          />
        ))}

        {columnIdeas.length === 0 && (
          <Button
            variant="ghost"
            className="w-full h-16 border border-dashed border-gray-200 hover:border-primary/30 
                     hover:bg-primary/5 hover:text-primary group"
            onClick={onCreateIdea}
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> New Idea
          </Button>
        )}
      </div>
    </div>
  );
};