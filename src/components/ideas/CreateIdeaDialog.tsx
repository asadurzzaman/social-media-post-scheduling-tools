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
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

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

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: async (acceptedFiles) => {
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
    }
  });

  const handleSave = async () => {
    try {
      const imageUrls: string[] = [];
      
      // Upload files to Supabase storage
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
    setContent(prev => prev + emoji.native);
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
          
          <Textarea
            placeholder="Let it flow... or use the AI Assistant"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
          />
          
          <div {...getRootProps()} className="cursor-pointer">
            <div className="flex items-center gap-2 border rounded-lg p-4 border-dashed hover:border-primary transition-colors">
              <input {...getInputProps()} />
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Drag & drop or <span className="text-primary">select a file</span>
              </span>
            </div>
          </div>
          
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                />
              </PopoverContent>
            </Popover>
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