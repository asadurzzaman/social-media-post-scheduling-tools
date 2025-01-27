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

  const getGridClass = () => {
    switch (previewUrls.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 md:grid-cols-3";
      default:
        return "grid-cols-2";
    }
  };

  const getImageClass = (index: number) => {
    if (previewUrls.length === 1) {
      return "h-[400px]";
    }
    if (previewUrls.length === 2) {
      return "h-[300px]";
    }
    if (previewUrls.length === 3 && index === 0) {
      return "h-[400px] md:col-span-2 md:row-span-2";
    }
    if (previewUrls.length === 4 && index < 2) {
      return "h-[300px]";
    }
    return "h-[200px]";
  };

  return (
    <div className={cn("grid gap-2", getGridClass(), className)}>
      {previewUrls.map((url, index) => (
        <div 
          key={index} 
          className={cn(
            "relative group rounded-lg overflow-hidden",
            getImageClass(index)
          )}
        >
          <img
            src={url}
            alt={`Preview ${index + 1}`}
            className="w-full h-full object-cover"
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
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
};