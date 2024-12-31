import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MediaGridProps {
  files: any[];
  selectedFiles: string[];
  onFileSelect: (fileName: string) => void;
  onDelete: (fileNames: string[]) => void;
  deletingFiles: string[];
  viewMode: "grid" | "list";
}

export const MediaGrid = ({
  files,
  selectedFiles,
  onFileSelect,
  onDelete,
  deletingFiles,
  viewMode,
}: MediaGridProps) => {
  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    return data?.publicUrl || '';
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {files?.map((file) => (
          <Card key={file.name} className="group relative overflow-hidden border border-border">
            <CardContent className="p-4">
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center relative group overflow-hidden">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedFiles.includes(file.name)}
                    onCheckedChange={() => onFileSelect(file.name)}
                  />
                </div>
                <img
                  src={getPublicUrl(file.name)}
                  alt={file.name}
                  className="object-cover w-full h-full rounded-lg transition-transform group-hover:scale-105"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDelete([file.name])}
                  disabled={deletingFiles.includes(file.name)}
                >
                  {deletingFiles.includes(file.name) ? (
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
    );
  }

  return (
    <div className="space-y-2">
      {files?.map((file) => (
        <div
          key={file.name}
          className="flex items-center justify-between p-4 bg-background border border-border rounded-lg"
        >
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedFiles.includes(file.name)}
              onCheckedChange={() => onFileSelect(file.name)}
            />
            <img
              src={getPublicUrl(file.name)}
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
            onClick={() => onDelete([file.name])}
            disabled={deletingFiles.includes(file.name)}
          >
            {deletingFiles.includes(file.name) ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
};