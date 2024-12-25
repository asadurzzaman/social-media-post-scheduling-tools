import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    content: string;
  };
  isEditing: boolean;
  editingTitle: string;
  editingContent: string;
  onTitleClick: () => void;
  onContentClick: () => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isEditing,
  editingTitle,
  editingContent,
  onTitleClick,
  onContentClick,
  onTitleChange,
  onContentChange,
  onBlur,
  onKeyDown,
}) => {
  return (
    <div className="bg-gray-50/50 rounded-md p-3 hover:bg-gray-50 transition-colors">
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editingTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="h-7 mb-1 border-primary/20 focus:border-primary"
            autoFocus
          />
          <Textarea
            value={editingContent}
            onChange={(e) => onContentChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="min-h-[60px] resize-none border-primary/20 focus:border-primary"
          />
        </div>
      ) : (
        <>
          <h4 
            className="font-medium cursor-pointer hover:text-primary transition-colors"
            onClick={onTitleClick}
          >
            {idea.title}
          </h4>
          <p 
            className="text-sm text-gray-600 line-clamp-2 mt-2 cursor-pointer hover:text-primary transition-colors"
            onClick={onContentClick}
          >
            {idea.content}
          </p>
        </>
      )}
    </div>
  );
};