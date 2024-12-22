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
      const { error } = await supabase.storage
        .from('media')
        .remove([fileName]);

      if (error) {
        toast.error(`Error deleting ${fileName}`);
        console.error('Error:', error);
      } else {
        toast.success(`${fileName} deleted successfully`);
        refetch();
      }
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
          <p className="text-muted-foreground">Upload and manage your media files</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
              }`}
            >
              <Input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">
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
            <Card key={file.name} className="overflow-hidden group relative">
              <CardContent className="p-4">
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center relative group">
                  {file.metadata?.mimetype?.startsWith('image/') ? (
                    <img
                      src={`${supabase.storage.from('media').getPublicUrl(file.name).data.publicUrl}`}
                      alt={file.name}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(file.name)}
                    disabled={deleting === file.name}
                  >
                    {deleting === file.name ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-sm truncate">{file.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Media;