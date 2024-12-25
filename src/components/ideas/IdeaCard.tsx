import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    content: string;
  };
  onUpdate: (ideaId: string, updates: any) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onUpdate }) => {
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
    <div 
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
      onClick={() => setIsEditing(true)}
    >
      <h4 className="font-medium cursor-pointer hover:text-blue-600 transition-colors">
        {idea.title}
      </h4>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 cursor-pointer hover:text-blue-600 transition-colors">
        {idea.content}
      </p>
    </div>
  );
};