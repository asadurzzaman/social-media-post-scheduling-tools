import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostType } from './PostTypeSelect';
import { ImagePreviewGrid } from './ImagePreviewGrid';

interface MediaUploadProps {
  postType: PostType;
  uploadedFiles: File[];
  previewUrls: string[];
  onFileUpload: (files: File[]) => void;
  onFileDelete: (index: number) => void;
}

export const MediaUpload = ({ 
  postType, 
  uploadedFiles, 
  previewUrls, 
  onFileUpload,
  onFileDelete
}: MediaUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles);
    }
  }, [onFileUpload]);

  const getAcceptedFiles = (type: PostType) => {
    switch (type) {
      case 'image':
        return { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] };
      case 'video':
        return { 'video/*': ['.mp4', '.mov', '.avi'] };
      case 'text':
        return {};
      default:
        return {};
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFiles(postType),
    maxFiles: 1,
    disabled: postType === 'text',
    multiple: false
  });

  if (postType === 'text') {
    return null;
  }

  return (
    <div className="space-y-4">
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
        {previewUrls.length > 0 ? (
          <div className="w-full">
            {postType === 'video' ? (
              <video 
                src={previewUrls[0]} 
                className="max-h-[180px] object-contain mb-4" 
                controls
              />
            ) : (
              <ImagePreviewGrid 
                previewUrls={previewUrls} 
                className="mb-4"
                onDelete={onFileDelete}
              />
            )}
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop the files here"
                : `Drag and drop your ${postType} here, or click to select`}
            </p>
          </>
        )}
      </div>
      {uploadedFiles.length === 0 && (
        <p className="text-sm text-orange-500">
          Please upload 1 {postType}
        </p>
      )}
    </div>
  );
};