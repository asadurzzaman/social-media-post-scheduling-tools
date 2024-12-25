import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmojiPicker } from "./EmojiPicker";
import { ImageUpload } from "./ImageUpload";

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = async (acceptedFiles: File[]) => {
    try {
      const newFiles = [...uploadedFiles, ...acceptedFiles];
      setUploadedFiles(newFiles);
      
      const newPreviewUrls = acceptedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
      
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload images");
    }
  };

  const handleSave = async () => {
    try {
      const imageUrls: string[] = [];
      
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
          
        imageUrls.push(publicUrl);
      }
      
      onSave({
        title,
        content,
        status,
        group_id: selectedGroup,
        createdAt: new Date().toISOString(),
        imageUrls
      });
      
      // Reset form
      setTitle("");
      setContent("");
      setStatus("unassigned");
      setUploadedFiles([]);
      setPreviewUrls([]);
      onClose();
      
      toast.success("Idea saved successfully!");
    } catch (error) {
      console.error("Error saving idea:", error);
      toast.error("Failed to save idea");
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + emoji.native + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after emoji
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = start + emoji.native.length;
          textAreaRef.current.focus();
        }
      }, 0);
    } else {
      setContent(prev => prev + emoji.native);
    }
  };

  const removeImage = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Idea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
          
          <Input
            placeholder="Give your idea a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
          
          <div className="relative">
            <Textarea
              ref={textAreaRef}
              placeholder="Let it flow... or use the AI Assistant"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Wand2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <ImageUpload
            onDrop={handleDrop}
            previewUrls={previewUrls}
            onRemoveImage={removeImage}
          />
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