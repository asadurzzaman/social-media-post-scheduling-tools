import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface MediaHeaderProps {
  selectedFiles: string[];
  onBulkDelete: () => void;
}

export const MediaHeader = ({ selectedFiles, onBulkDelete }: MediaHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
        <p className="text-muted-foreground mt-2">Upload and manage your media files</p>
      </div>
      {selectedFiles.length > 0 && (
        <Button 
          variant="destructive" 
          onClick={onBulkDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Selected ({selectedFiles.length})
        </Button>
      )}
    </div>
  );
};