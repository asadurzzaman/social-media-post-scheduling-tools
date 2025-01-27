import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePreviewGrid } from './ImagePreviewGrid';
import { Upload } from 'lucide-react';

interface MediaUploadProps {
  onFilesSelected: (files: File[]) => void;
  previewUrls: string[];
  onDeleteImage?: (index: number) => void;
}

export const MediaUpload = ({ onFilesSelected, previewUrls, onDeleteImage }: MediaUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 4
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg mb-2 font-medium">
          {isDragActive
            ? "Drop the images here..."
            : "Drag 'n' drop images here, or click to select"}
        </p>
        <p className="text-sm text-muted-foreground">
          Supports: PNG, JPG, GIF (Max 4 images)
        </p>
      </div>

      <ImagePreviewGrid 
        previewUrls={previewUrls} 
        onDelete={onDeleteImage}
      />
    </div>
  );
};