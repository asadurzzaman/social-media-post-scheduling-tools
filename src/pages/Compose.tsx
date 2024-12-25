import { DashboardLayout } from "@/components/DashboardLayout";
import { CreateIdeaDialog } from "@/components/ideas/CreateIdeaDialog";
import { CreateGroupDialog } from "@/components/ideas/CreateGroupDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IdeaColumn } from "@/components/ideas/IdeaColumn";

interface Column {
  id: string;
  title: string;
  status: string;
}

const Compose = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([
    { id: "1", title: "Unassigned", status: "unassigned" },
    { id: "2", title: "To Do", status: "todo" },
    { id: "3", title: "In Progress", status: "in-progress" },
    { id: "4", title: "Done", status: "done" },
  ]);

  useEffect(() => {
    fetchGroups();
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      toast.error('Failed to fetch ideas');
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

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('idea_groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      toast.error('Failed to fetch groups');
    }
  };

  const handleSaveIdea = async (idea: any) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .insert([{
          title: idea.title,
          content: idea.content,
          status: idea.status || 'unassigned',
          group_id: selectedGroup,
          image_urls: idea.imageUrls
        }])
        .select()
        .single();

      if (error) throw error;

      setIdeas([data, ...ideas]);
      toast.success("Idea saved successfully");
    } catch (error) {
      toast.error('Failed to save idea');
    }
  };

  const handleSaveGroup = async () => {
    await fetchGroups();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create Idea</h2>
          </div>
        </div>

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
              onDeleteIdea={handleDeleteIdea}
            />
          ))}
        </div>

        <CreateIdeaDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSave={handleSaveIdea}
          selectedGroup={selectedGroup}
        />

        <CreateGroupDialog
          isOpen={isCreateGroupDialogOpen}
          onClose={() => setIsCreateGroupDialogOpen(false)}
          onSave={handleSaveGroup}
        />
      </div>
    </DashboardLayout>
  );
};

export default Compose;