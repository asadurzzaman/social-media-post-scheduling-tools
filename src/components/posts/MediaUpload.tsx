import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostType } from './PostTypeSelect';

interface MediaUploadProps {
  postType: PostType;
  uploadedFile: File | null;
  previewUrl: string | null;
  onFileUpload: (file: File) => void;
}

export const MediaUpload = ({ 
  postType, 
  uploadedFile, 
  previewUrl, 
  onFileUpload 
}: MediaUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const getAcceptedFiles = (type: PostType) => {
    switch (type) {
      case 'image':
        return { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] };
      case 'video':
        return { 'video/*': ['.mp4', '.mov', '.avi'] };
      case 'carousel':
        return { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] };
      case 'text-only':
        return {};
      default:
        return {};
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFiles(postType),
    maxFiles: postType === 'carousel' ? 10 : 1,
    disabled: postType === 'text-only'
  });

  // Early return for text-only posts
  if (postType === 'text-only') {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Media Upload <span className="text-red-500">*</span>
      </label>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50",
          "relative min-h-[200px] flex flex-col items-center justify-center"
        )}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <>
            {postType === 'video' ? (
              <video 
                src={previewUrl} 
                className="max-h-[180px] object-contain mb-4" 
                controls
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[180px] object-contain mb-4"
              />
            )}
            <p className="text-sm text-muted-foreground">
              Click or drag to replace
            </p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop the file here"
                : `Drag and drop your ${postType} here, or click to select`}
            </p>
            {postType === 'carousel' && (
              <p className="text-sm text-muted-foreground mt-2">
                You can upload up to 10 images
              </p>
            )}
          </>
        )}
      </div>
      {!uploadedFile && postType !== 'text-only' && (
        <p className="text-sm text-orange-500">
          Please upload {postType === 'carousel' ? 'at least one image' : `1 ${postType}`}
        </p>
      )}
    </div>
  );
};