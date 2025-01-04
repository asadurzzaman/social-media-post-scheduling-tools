import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IdeaColumn } from "./IdeaColumn";
import { CreateIdeaDialog } from "./CreateIdeaDialog";
import { DragDropContext } from '@hello-pangea/dnd';

export const IdeaManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  
  const [columns] = useState([
    { id: "1", title: "Unassigned", status: "unassigned" },
    { id: "2", title: "To Do", status: "todo" },
    { id: "3", title: "In Progress", status: "in-progress" },
    { id: "4", title: "Done", status: "done" },
  ]);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user.id) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      toast.error('Failed to fetch ideas');
    }
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destinationColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destinationColumn) return;

    try {
      const updatedIdea = ideas.find(idea => idea.id === draggableId);
      if (!updatedIdea) return;

      // Update idea status if moving between columns
      if (sourceColumn.id !== destinationColumn.id) {
        await handleUpdateIdea(draggableId, {
          status: destinationColumn.status
        });
      }

      // Reorder ideas within the same column
      const newIdeas = Array.from(ideas);
      const [removed] = newIdeas.splice(source.index, 1);
      newIdeas.splice(destination.index, 0, removed);
      setIdeas(newIdeas);

    } catch (error) {
      toast.error('Failed to move idea');
    }
  };

  const handleUpdateIdea = async (ideaId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', ideaId);

      if (error) throw error;

      setIdeas(ideas.map(idea => 
        idea.id === ideaId 
          ? { ...idea, ...updates }
          : idea
      ));
      toast.success("Idea updated successfully");
    } catch (error) {
      toast.error('Failed to update idea');
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;

      setIdeas(ideas.filter(idea => idea.id !== ideaId));
      toast.success("Idea deleted successfully");
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  };

  const handleReorderIdeas = async (sourceIndex: number, destinationIndex: number) => {
    try {
      const newIdeas = reorderIdeas(ideas, sourceIndex, destinationIndex);
      setIdeas(newIdeas);
      
      // Update the order in the database if needed
      // This is optional - you can implement a position/order field in your ideas table
      // and update it here if you want the order to persist
      
      toast.success("Ideas reordered successfully");
    } catch (error) {
      console.error("Error reordering ideas:", error);
      toast.error("Failed to reorder ideas");
    }
  };

  const handleSaveIdea = async (idea: any) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user.id) {
        toast.error('Not authenticated');
        return;
      }

      if (idea.id) {
        // Update existing idea
        const { error } = await supabase
          .from('ideas')
          .update({
            title: idea.title,
            content: idea.content,
            status: idea.status,
            group_id: selectedGroup,
            image_urls: idea.imageUrls,
          })
          .eq('id', idea.id);

        if (error) throw error;

        setIdeas(ideas.map(i => 
          i.id === idea.id 
            ? { ...i, ...idea }
            : i
        ));
      } else {
        // Create new idea
        const { data, error } = await supabase
          .from('ideas')
          .insert({
            title: idea.title,
            content: idea.content,
            status: idea.status || 'unassigned',
            group_id: selectedGroup,
            image_urls: idea.imageUrls,
            user_id: sessionData.session.user.id
          })
          .select()
          .single();

        if (error) throw error;
        setIdeas([data, ...ideas]);
      }

      setSelectedIdea(null);
      setIsCreateDialogOpen(false);
      toast.success(`Idea ${idea.id ? 'updated' : 'saved'} successfully!`);
    } catch (error) {
      console.error("Error saving idea:", error);
      toast.error(`Failed to ${idea.id ? 'update' : 'save'} idea`);
    }
  };

  const handleRenameColumn = (column: any) => {
    const updatedColumns = columns.map(col => 
      col.id === column.id ? { ...col, title: column.title } : col
    );
    toast.success("Column renamed successfully");
  };

  const handleDeleteColumn = (columnId: string) => {
    const updatedIdeas = ideas.map(idea => 
      idea.status === columns.find(col => col.id === columnId)?.status
        ? { ...idea, status: "unassigned" }
        : idea
    );
    setIdeas(updatedIdeas);
    const updatedColumns = columns.filter(col => col.id !== columnId);
    toast.success("Column deleted and ideas moved to Unassigned");
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
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
              onCreateIdea={() => {
                setSelectedIdea(null);
                setIsCreateDialogOpen(true);
              }}
              onUpdateIdea={handleUpdateIdea}
              onDeleteIdea={handleDeleteIdea}
              onEditIdea={(idea) => {
                const ideaToEdit = ideas.find(i => i.id === idea.id);
                setSelectedIdea(ideaToEdit);
                setIsCreateDialogOpen(true);
              }}
            />
          ))}
        </div>
      </DragDropContext>

      <CreateIdeaDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setSelectedIdea(null);
        }}
        onSave={handleSaveIdea}
        selectedGroup={selectedGroup}
        initialIdea={selectedIdea}
        mode={selectedIdea ? 'edit' : 'create'}
      />
    </div>
  );
};
