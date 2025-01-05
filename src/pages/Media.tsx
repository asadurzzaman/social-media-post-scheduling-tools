import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Media = () => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleDelete = async (fileName: string) => {
    setDeleting(fileName);
    try {
      // First, check if the file exists in storage
      const { data: fileExists } = await supabase
        .storage
        .from('media')
        .list('', {
          search: fileName
        });

      if (!fileExists || fileExists.length === 0) {
        toast.error('File not found in storage');
        return;
      }

      // Delete from storage
      const { error: deleteError } = await supabase
        .storage
        .from('media')
        .remove([fileName]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        toast.error(`Error deleting ${fileName}`);
        return;
      }

      // Check if the file was actually deleted from storage
      const { data: checkDelete } = await supabase
        .storage
        .from('media')
        .list('', {
          search: fileName
        });

      if (checkDelete && checkDelete.length > 0) {
        toast.error('Failed to delete file from storage');
        return;
      }

      toast.success(`${fileName} deleted successfully`);
      await refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground mt-2">Upload and manage your media files</p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaFiles?.map((file) => (
            <Card key={file.name} className="group relative overflow-hidden border border-border">
              <CardContent className="p-4">
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center relative group overflow-hidden">
                  {file.metadata?.mimetype?.startsWith('image/') ? (
                    <img
                      src={`${supabase.storage.from('media').getPublicUrl(file.name).data.publicUrl}`}
                      alt={file.name}
                      className="object-cover w-full h-full rounded-lg transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(file.name)}
                    disabled={deleting === file.name}
                  >
                    {deleting === file.name ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-sm truncate text-muted-foreground">{file.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Media;