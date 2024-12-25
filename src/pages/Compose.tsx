import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreateIdeaDialog } from "@/components/ideas/CreateIdeaDialog";
import { CreateGroupDialog } from "@/components/ideas/CreateGroupDialog";
import { Tags, LayoutGrid, FolderPlus } from "lucide-react";
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
  }, []);

  const handleUpdateIdea = (ideaId: string, updates: any) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId 
        ? { ...idea, ...updates }
        : idea
    ));
    toast.success("Idea updated successfully");
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

  const handleSaveIdea = (idea: any) => {
    setIdeas([...ideas, idea]);
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
      <div className="space-y-6 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Create Idea</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Tags className="h-4 w-4 mr-2" />
              Tags
            </Button>
            <Button variant="outline" size="sm">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsCreateGroupDialogOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Group
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              New Idea
            </Button>
          </div>
        </div>

        <div className="h-[calc(100vh-280px)] w-full overflow-auto">
          <div className="grid grid-cols-4 gap-4 p-1">
            {columns.map((column, index) => (
              <div key={column.id} className="w-[300px]">
                <IdeaColumn
                  column={column}
                  ideas={ideas}
                  index={index}
                  onRename={handleRenameColumn}
                  onDelete={handleDeleteColumn}
                  onMove={moveColumn}
                  onCreateIdea={() => setIsCreateDialogOpen(true)}
                  onUpdateIdea={handleUpdateIdea}
                />
              </div>
            ))}
          </div>
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
