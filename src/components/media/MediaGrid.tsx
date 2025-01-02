import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MediaItem } from "./MediaItem";

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
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 12;
  const totalPages = Math.ceil((files?.length || 0) / filesPerPage);
  
  const startIndex = (currentPage - 1) * filesPerPage;
  const endIndex = startIndex + filesPerPage;
  const currentFiles = files?.slice(startIndex, endIndex) || [];

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                onClick={() => setCurrentPage(i + 1)}
                isActive={currentPage === i + 1}
                className="cursor-pointer"
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (viewMode === "grid") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {currentFiles.map((file) => (
            <MediaItem
              key={file.name}
              file={file}
              onFileSelect={onFileSelect}
              onDelete={onDelete}
              isSelected={selectedFiles.includes(file.name)}
              isDeleting={deletingFiles.includes(file.name)}
            />
          ))}
        </div>
        {renderPagination()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {currentFiles.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between p-4 bg-background border border-border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedFiles.includes(file.name)}
                onCheckedChange={() => onFileSelect(file.name)}
              />
              <div className="w-12 h-12">
                <MediaItem
                  file={file}
                  onFileSelect={onFileSelect}
                  onDelete={onDelete}
                  isSelected={selectedFiles.includes(file.name)}
                  isDeleting={deletingFiles.includes(file.name)}
                />
              </div>
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
      {renderPagination()}
    </div>
  );
};