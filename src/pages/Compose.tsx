import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreateIdeaDialog } from "@/components/ideas/CreateIdeaDialog";
import { LayoutGrid, Plus, Share2, Tags } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IdeaColumn } from "@/components/ideas/IdeaColumn";
import { DragDropContext } from "react-beautiful-dnd";

interface Column {
  id: string;
  title: string;
  status: string;
}

const Compose = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { id: "1", title: "Unassigned", status: "unassigned" },
    { id: "2", title: "To Do", status: "todo" },
    { id: "3", title: "In Progress", status: "in-progress" },
    { id: "4", title: "Done", status: "done" },
  ]);

  const handleUpdateIdea = (ideaId: string, updates: any) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId 
        ? { ...idea, ...updates }
        : idea
    ));
    toast.success("Idea updated successfully");
  };

  const handleSaveIdea = (idea: any) => {
    setIdeas([...ideas, idea]);
  };

  const handleRenameColumn = (column: Column) => {
    setColumns(columns.map(col => 
      col.id === column.id 
        ? { ...col, title: column.title }
        : col
    ));
    toast.success("Column renamed successfully");
  };

  const handleDeleteColumn = (columnId: string) => {
    const updatedIdeas = ideas.map(idea => 
      idea.status === columns.find(col => col.id === columnId)?.status
        ? { ...idea, status: "unassigned" }
        : idea
    );
    setIdeas(updatedIdeas);
    setColumns(columns.filter(col => col.id !== columnId));
    toast.success("Column deleted and ideas moved to Unassigned");
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    setColumns(newColumns);
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const idea = ideas.find(i => i.id === draggableId);
    if (!idea) return;

    const newStatus = columns.find(col => col.id === destination.droppableId)?.status;
    if (!newStatus) return;

    const updatedIdea = {
      ...idea,
      status: newStatus
    };

    const newIdeas = ideas.map(i => 
      i.id === draggableId ? updatedIdea : i
    );

    setIdeas(newIdeas);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Ideas</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Feedback
            </Button>
            <Button variant="outline" size="sm">
              <Tags className="h-4 w-4 mr-2" />
              Tags
            </Button>
            <Button variant="secondary" size="sm">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {columns.map((column, index) => (
              <IdeaColumn
                key={column.id}
                column={column}
                ideas={ideas}
                index={index}
                onRename={handleRenameColumn}
                onDelete={handleDeleteColumn}
                onMove={moveColumn}
                onCreateIdea={() => setIsCreateDialogOpen(true)}
                onUpdateIdea={handleUpdateIdea}
              />
            ))}
          </div>
        </DragDropContext>

        <CreateIdeaDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSave={handleSaveIdea}
        />
      </div>
    </DashboardLayout>
  );
};

export default Compose;