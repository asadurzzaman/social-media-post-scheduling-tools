import React from 'react';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    content: string;
  };
  index: number;
  onUpdate: (ideaId: string, updates: any) => void;
  onDelete?: (ideaId: string) => void;
  onEdit?: (idea: any) => void;
  isDragging?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  onUpdate, 
  onDelete, 
  onEdit,
  isDragging 
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(idea.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(idea);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 group relative ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="ml-6">
        <h4 className="font-medium">
          {idea.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {idea.content}
        </p>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4 text-blue-500" />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
};