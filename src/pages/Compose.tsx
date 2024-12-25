import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreateIdeaDialog } from "@/components/ideas/CreateIdeaDialog";
import { LayoutGrid, Plus, Share2, Tags } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IdeaColumn } from "@/components/ideas/IdeaColumn";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { StrictMode } from "react";

const Compose = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [columns] = useState([
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

  const onDragEnd = (result: DropResult) => {
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

        <StrictMode>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-4 gap-4">
              {columns.map((column, index) => (
                <IdeaColumn
                  key={column.id}
                  column={column}
                  ideas={ideas}
                  index={index}
                  onRename={() => {}}
                  onDelete={() => {}}
                  onMove={() => {}}
                  onCreateIdea={() => setIsCreateDialogOpen(true)}
                  onUpdateIdea={handleUpdateIdea}
                />
              ))}
            </div>
          </DragDropContext>
        </StrictMode>

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