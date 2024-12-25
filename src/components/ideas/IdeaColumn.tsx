import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { IdeaCard } from "./IdeaCard";

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
  onCreateIdea,
  onUpdateIdea,
}: IdeaColumnProps) => {
  const columnIdeas = ideas.filter((idea) => idea.status === column.status);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-t-lg p-3 border border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{column.title}</h3>
            <span className="text-sm text-muted-foreground">
              {columnIdeas.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={onCreateIdea}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 space-y-2 min-h-[200px] bg-slate-50 rounded-b-lg border border-t-0 ${
              snapshot.isDraggingOver ? "bg-slate-100" : ""
            }`}
          >
            {columnIdeas.map((idea, index) => (
              <Draggable key={idea.id} draggableId={idea.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                  >
                    <IdeaCard idea={idea} onUpdate={onUpdateIdea} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {columnIdeas.length === 0 && (
              <button
                onClick={onCreateIdea}
                className="w-full h-20 rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 flex items-center justify-center transition-colors group"
              >
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">New Idea</span>
                </div>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};