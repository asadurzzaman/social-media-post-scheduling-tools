import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MediaItemProps {
  file: any;
  onFileSelect: (fileName: string) => void;
  onDelete: (fileNames: string[]) => void;
  isSelected: boolean;
  isDeleting: boolean;
}

export const MediaItem = ({ 
  file, 
  onFileSelect, 
  onDelete, 
  isSelected,
  isDeleting 
}: MediaItemProps) => {
  const getPublicUrl = (fileName: string) => {
    try {
      const { data } = supabase.storage.from('media').getPublicUrl(fileName);
      if (!data?.publicUrl) {
        console.error('Failed to get public URL for:', fileName);
        return '';
      }
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting public URL:', error);
      toast.error(`Failed to load file: ${fileName}`);
      return '';
    }
  };

  const isVideoFile = (fileName: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const renderMedia = () => {
    const url = getPublicUrl(file.name);
    if (!url) {
      return (
        <div className="aspect-square bg-muted flex items-center justify-center rounded-lg">
          <span className="text-sm text-muted-foreground">No preview</span>
        </div>
      );
    }

    if (isVideoFile(file.name)) {
      return (
        <video
          src={url}
          className="object-cover w-full h-full rounded-lg transition-transform group-hover:scale-105"
          controls
          muted
          onError={() => toast.error(`Failed to load video: ${file.name}`)}
        />
      );
    }

    return (
      <img
        src={url}
        alt={file.name}
        className="object-cover w-full h-full rounded-lg transition-transform group-hover:scale-105"
        onError={() => toast.error(`Failed to load image: ${file.name}`)}
      />
    );
  };

  return (
    <div className="group relative overflow-hidden border border-border rounded-lg">
      <div className="p-4">
        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center relative group overflow-hidden">
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onFileSelect(file.name)}
            />
          </div>
          {renderMedia()}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete([file.name])}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-sm truncate text-muted-foreground">{file.name}</p>
      </div>
    </div>
  );
};