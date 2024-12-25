import { ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onDrop: (acceptedFiles: File[]) => void;
  previewUrls: string[];
  onRemoveImage: (index: number) => void;
}

export function ImageUpload({ onDrop, previewUrls, onRemoveImage }: ImageUploadProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop
  });

  return (
    <div className="space-y-4">
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
                onClick={() => onRemoveImage(index)}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}