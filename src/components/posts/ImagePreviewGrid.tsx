import { cn } from "@/lib/utils";

interface ImagePreviewGridProps {
  previewUrls: string[];
  className?: string;
}

export const ImagePreviewGrid = ({ previewUrls, className }: ImagePreviewGridProps) => {
  if (previewUrls.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
      {previewUrls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Preview ${index + 1}`}
          className="w-full h-40 object-cover rounded-lg"
        />
      ))}
    </div>
  );
};