import { DashboardLayout } from "@/components/DashboardLayout";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaHeader } from "@/components/media/MediaHeader";
import { MediaUploader } from "@/components/media/MediaUploader";
import { MediaFilters } from "@/components/media/MediaFilters";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useUser } from "@/hooks/useUser";

const Media = () => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { userId } = useUser();

  const { data: mediaFiles, refetch } = useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const { data: files, error } = await supabase
        .storage
        .from('media')
        .list();
      
      if (error) {
        toast.error('Failed to load media files');
        throw error;
      }

      return files || [];
    }
  });

  const filteredFiles = mediaFiles?.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = dateFilter === "all" ? true : 
      dateFilter === "recent" ? new Date(file.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 :
      dateFilter === "old" ? new Date(file.created_at).getTime() <= Date.now() - 7 * 24 * 60 * 60 * 1000 :
      true;
    
    return matchesSearch && matchesDate;
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file);

        if (uploadError) {
          toast.error(`Error uploading ${file.name}`);
          console.error('Error:', uploadError);
          continue;
        }

        // Insert record into media_files table
        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            user_id: userId,
            file_name: fileName,
            file_path: fileName,
            file_type: fileExt || 'unknown',
            file_size: file.size,
            mime_type: file.type,
          });

        if (dbError) {
          console.error('Database error:', dbError);
          toast.error(`Error saving metadata for ${file.name}`);
        } else {
          toast.success(`${file.name} uploaded successfully`);
        }
      }
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [refetch, userId]);

  const handleDelete = async (fileNames: string[]) => {
    setDeleting(fileNames);
    try {
      // First, delete from media_files table
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .in('file_name', fileNames);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        toast.error('Error removing file metadata');
        return;
      }

      // Then delete from storage
      const { error: storageError } = await supabase
        .storage
        .from('media')
        .remove(fileNames);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        toast.error('Error deleting files from storage');
        return;
      }

      toast.success(`${fileNames.length} file(s) deleted successfully`);
      setSelectedFiles([]);
      await refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete files');
    } finally {
      setDeleting([]);
    }
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }
    handleDelete(selectedFiles);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MediaHeader 
          selectedFiles={selectedFiles}
          onBulkDelete={handleBulkDelete}
        />

        <MediaUploader 
          onDrop={onDrop}
          uploading={uploading}
        />

        <div className="flex flex-col gap-4">
          <MediaFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <MediaGrid
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onFileSelect={toggleFileSelection}
            onDelete={handleDelete}
            deletingFiles={deleting}
            viewMode={viewMode}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Media;