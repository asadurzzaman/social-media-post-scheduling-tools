import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  onUpdateIdea: (ideaId: string, updates: any) => void;
}

export const IdeaColumn = ({
  column,
  ideas,
  index,
  onRename,
  onDelete,
  onMove,
  onCreateIdea,
  onUpdateIdea,
}: IdeaColumnProps) => {
  const columnIdeas = ideas.filter((idea) => idea.status === column.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{column.title}</h3>
        <span className="text-sm text-muted-foreground">
          {columnIdeas.length}
        </span>
      </div>

      <div className="space-y-4">
        {columnIdeas.map((idea) => (
          <Card key={idea.id} className="p-4">
            <p>{idea.content}</p>
          </Card>
        ))}

        <button
          onClick={onCreateIdea}
          className="w-full h-32 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 flex items-center justify-center transition-colors group"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground">
            <Plus className="h-6 w-6" />
            <span>New Idea</span>
          </div>
        </button>
      </div>
    </div>
  );
};