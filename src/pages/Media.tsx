import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Grid, List, Search, Filter, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
            <p className="text-muted-foreground mt-2">Upload and manage your media files</p>
          </div>
          {selectedFiles.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
              disabled={deleting.length > 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedFiles.length})
            </Button>
          )}
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

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search media files..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="recent">Last 7 days</SelectItem>
                  <SelectItem value="old">Older than 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFiles?.map((file) => (
                <Card key={file.name} className="group relative overflow-hidden border border-border">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center relative group overflow-hidden">
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedFiles.includes(file.name)}
                          onCheckedChange={() => toggleFileSelection(file.name)}
                        />
                      </div>
                      <img
                        src={`${supabase.storage.from('media').getPublicUrl(file.name).data.publicUrl}`}
                        alt={file.name}
                        className="object-cover w-full h-full rounded-lg transition-transform group-hover:scale-105"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete([file.name])}
                        disabled={deleting.includes(file.name)}
                      >
                        {deleting.includes(file.name) ? (
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
          ) : (
            <div className="space-y-2">
              {filteredFiles?.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-4 bg-background border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedFiles.includes(file.name)}
                      onCheckedChange={() => toggleFileSelection(file.name)}
                    />
                    <img
                      src={`${supabase.storage.from('media').getPublicUrl(file.name).data.publicUrl}`}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete([file.name])}
                    disabled={deleting.includes(file.name)}
                  >
                    {deleting.includes(file.name) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Media;