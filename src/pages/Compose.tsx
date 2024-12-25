import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreateIdeaDialog } from "@/components/ideas/CreateIdeaDialog";
import { CreateGroupDialog } from "@/components/ideas/CreateGroupDialog";
import { Plus, Tags, LayoutGrid, FolderPlus, GripHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [columnToRename, setColumnToRename] = useState<Column | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [columns, setColumns] = useState<Column[]>([
    { id: "1", title: "Unassigned", status: "unassigned" },
    { id: "2", title: "To Do", status: "todo" },
    { id: "3", title: "In Progress", status: "in-progress" },
    { id: "4", title: "Done", status: "done" },
  ]);

  useEffect(() => {
    fetchGroups();
  }, []);

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

  const handleSaveGroup = async (group: any) => {
    await fetchGroups();
  };

  const handleRenameColumn = (column: Column) => {
    setColumnToRename(column);
    setNewColumnName(column.title);
    setIsRenameDialogOpen(true);
  };

  const handleSaveColumnRename = () => {
    if (columnToRename) {
      setColumns(columns.map(col => 
        col.id === columnToRename.id 
          ? { ...col, title: newColumnName }
          : col
      ));
      setIsRenameDialogOpen(false);
      toast.success("Column renamed successfully");
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    // Move ideas to unassigned before deleting
    const updatedIdeas = ideas.map(idea => 
      idea.status === columns.find(col => col.id === columnId)?.status
        ? { ...idea, status: "unassigned" }
        : idea
    );
    setIdeas(updatedIdeas);
    
    // Remove the column
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
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Groups sidebar */}
          <div className="col-span-1 bg-background rounded-lg p-4 space-y-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Groups</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsCreateGroupDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <span className="truncate">{group.name}</span>
                </Button>
              ))}
              {groups.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No groups created yet
                </p>
              )}
            </div>
          </div>

          {/* Ideas board */}
          <div className="col-span-4 grid grid-cols-4 gap-4">
            {columns.map((column, index) => (
              <ContextMenu key={column.id}>
                <ContextMenuTrigger>
                  <div 
                    className="bg-background rounded-lg p-4 space-y-4 border border-gray-100 cursor-move relative group"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", index.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                      moveColumn(fromIndex, index);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripHorizontal className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="font-semibold">{column.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {ideas.filter(i => i.status === column.status).length}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {ideas
                      .filter((idea) => idea.status === column.status)
                      .map((idea, ideaIndex) => (
                        <div
                          key={ideaIndex}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                        >
                          <h4 className="font-medium">{idea.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {idea.content}
                          </p>
                        </div>
                      ))}

                    {ideas.filter(idea => idea.status === column.status).length === 0 && (
                      <Button
                        variant="ghost"
                        className="w-full h-24 border-2 border-dashed border-gray-200 hover:border-gray-300"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> New Idea
                      </Button>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleRenameColumn(column)}>
                    Rename
                  </ContextMenuItem>
                  {column.status !== "unassigned" && (
                    <ContextMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteColumn(column.id)}
                    >
                      Delete
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
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

        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Column</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter new name"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveColumnRename}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Compose;