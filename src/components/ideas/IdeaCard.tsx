import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    content: string;
  };
  onUpdate: (ideaId: string, updates: any) => void;
  onDelete?: (ideaId: string) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(idea.title);
  const [editingContent, setEditingContent] = useState(idea.content);

  const handleBlur = () => {
    const updates: any = {};
    if (editingTitle.trim() !== '') {
      updates.title = editingTitle.trim();
    }
    if (editingContent.trim() !== '') {
      updates.content = editingContent.trim();
    }
    if (Object.keys(updates).length > 0) {
      onUpdate(idea.id, updates);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingTitle(idea.title);
      setEditingContent(idea.content);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(idea.id);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-2">
        <Input
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-7 mb-1"
          autoFocus
        />
        <Textarea
          value={editingContent}
          onChange={(e) => setEditingContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] resize-none"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 group relative">
      <div 
        className="cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <h4 className="font-medium hover:text-blue-600 transition-colors">
          {idea.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 hover:text-blue-600 transition-colors">
          {idea.content}
        </p>
      </div>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  );
};