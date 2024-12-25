import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ImageIcon, Smile, Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateIdeaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: any) => void;
  selectedGroup?: string | null;
}

export function CreateIdeaDialog({ isOpen, onClose, onSave, selectedGroup }: CreateIdeaDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("unassigned");

  const handleSave = () => {
    onSave({
      title,
      content,
      status,
      group_id: selectedGroup,
      createdAt: new Date().toISOString(),
    });
    setTitle("");
    setContent("");
    setStatus("unassigned");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Idea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Add Tags
            </Button>
          </div>
          
          <Input
            placeholder="Give your idea a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
          
          <Textarea
            placeholder="Let it flow... or use the AI Assistant"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
          />
          
          <div className="flex items-center gap-2 border rounded-lg p-4 border-dashed">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Drag & drop or <span className="text-primary">select a file</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Smile className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="gap-2">
              <Wand2 className="h-5 w-5" />
              AI Assistant
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Idea
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}