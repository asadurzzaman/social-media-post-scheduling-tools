import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewGridProps {
  previewUrls: string[];
  className?: string;
  onDelete?: (index: number) => void;
}

export const ImagePreviewGrid = ({ 
  previewUrls, 
  className,
  onDelete 
}: ImagePreviewGridProps) => {
  if (previewUrls.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
      {previewUrls.map((url, index) => (
        <div key={index} className="relative group">
          <img
            src={url}
            alt={`Preview ${index + 1}`}
            className="w-full h-40 object-cover rounded-lg"
          />
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};