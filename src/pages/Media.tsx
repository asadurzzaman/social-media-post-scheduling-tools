import { DashboardLayout } from "@/components/DashboardLayout";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaHeader } from "@/components/media/MediaHeader";
import { MediaUploader } from "@/components/media/MediaUploader";
import { MediaFilters } from "@/components/media/MediaFilters";
import { MediaGrid } from "@/components/media/MediaGrid";

const Media = () => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("all");

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

        const { error } = await supabase.storage
          .from('media')
          .upload(fileName, file);

        if (error) {
          toast.error(`Error uploading ${file.name}`);
          console.error('Error:', error);
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
  }, [refetch]);

  const handleDelete = async (fileNames: string[]) => {
    setDeleting(fileNames);
    try {
      const { error: deleteError } = await supabase
        .storage
        .from('media')
        .remove(fileNames);

      if (deleteError) {
        toast.error('Error deleting files');
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