import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Video, FileText, Link2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostType } from './PostTypeSelect';
import { ImagePreviewGrid } from './ImagePreviewGrid';
import { Button } from "@/components/ui/button";

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
      case 'carousel':
        return { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] };
      case 'text':
      case 'link':
      case 'poll':
      case 'story':
        return {};
      default:
        return {};
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFiles(postType),
    maxFiles: postType === 'carousel' ? 10 : 1,
    disabled: postType === 'text' || postType === 'link' || postType === 'poll',
    multiple: postType === 'carousel'
  });

  if (postType === 'text' || postType === 'link' || postType === 'poll') {
    return null;
  }

  const getMediaIcon = () => {
    switch (postType) {
      case 'image':
        return <ImageIcon className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'carousel':
        return <ImageIcon className="h-6 w-6" />;
      case 'link':
        return <Link2 className="h-6 w-6" />;
      case 'poll':
        return <BarChart3 className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Media Upload <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>
      
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
            {postType === 'carousel' && previewUrls.length < 10 && (
              <p className="text-sm text-muted-foreground mt-4">
                Click or drag to add more images ({10 - previewUrls.length} remaining)
              </p>
            )}
          </div>
        ) : (
          <>
            {getMediaIcon()}
            <p className="text-sm text-muted-foreground mt-4">
              {isDragActive
                ? "Drop the files here"
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
      {uploadedFiles.length === 0 && (
        <p className="text-sm text-orange-500">
          Please upload {postType === 'carousel' ? 'at least one image' : `1 ${postType}`}
        </p>
      )}
    </div>
  );
};