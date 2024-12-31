import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface MediaUploaderProps {
  onDrop: (acceptedFiles: File[]) => void;
  uploading: boolean;
}

export const MediaUploader = ({ onDrop, uploading }: MediaUploaderProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  return (
    <Card className="border border-border">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <Input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-2 font-medium">
            {isDragActive
              ? "Drop the files here..."
              : "Drag 'n' drop files here, or click to select files"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: PNG, JPG, GIF
          </p>
          {uploading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};