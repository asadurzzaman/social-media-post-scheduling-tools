import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreateIdeaDialog } from "@/components/ideas/CreateIdeaDialog";
import { Plus, Share2, Tags, LayoutGrid } from "lucide-react";
import { useState } from "react";

const Compose = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);

  const handleSaveIdea = (idea: any) => {
    setIdeas([...ideas, idea]);
  };

  const columns = [
    { title: "Unassigned", count: ideas.filter(i => i.status === "unassigned").length },
    { title: "To Do", count: ideas.filter(i => i.status === "todo").length },
    { title: "In Progress", count: ideas.filter(i => i.status === "in-progress").length },
    { title: "Done", count: ideas.filter(i => i.status === "done").length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Create Idea</h2>
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
            <Button variant="outline" size="sm">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div
              key={column.title}
              className="bg-background rounded-lg p-4 space-y-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{column.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {column.count}
                  </span>
                </div>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {ideas
                .filter((idea) => {
                  const status = idea.status || "unassigned";
                  return status.toLowerCase().replace(" ", "-") === column.title.toLowerCase().replace(" ", "-");
                })
                .map((idea, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                  >
                    <h4 className="font-medium">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {idea.content}
                    </p>
                  </div>
                ))}

              {ideas.filter(
                (idea) =>
                  (idea.status || "unassigned").toLowerCase().replace(" ", "-") ===
                  column.title.toLowerCase().replace(" ", "-")
              ).length === 0 && (
                <Button
                  variant="ghost"
                  className="w-full h-24 border-2 border-dashed border-gray-200 hover:border-gray-300"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> New Idea
                </Button>
              )}
            </div>
          ))}
        </div>

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