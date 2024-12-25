import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableTags] = useState([
    "Important", "Urgent", "Feature", "Bug", "Enhancement", "Documentation"
  ]);

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
      toast.success(`Added tag: ${tag}`);
    }
    setSearchQuery("");
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
    toast.success(`Removed tag: ${tagToRemove}`);
  };

  const handleCreateTag = () => {
    if (searchQuery.trim()) {
      const newTag = searchQuery.trim();
      if (!availableTags.includes(newTag) && !selectedTags.includes(newTag)) {
        handleTagSelect(newTag);
        setIsOpen(false);
      } else {
        toast.error("This tag already exists");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[180px] justify-between"
            role="combobox"
          >
            Add Tags
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-3">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search or create tag"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              {searchQuery && (
                <Button 
                  size="icon"
                  onClick={handleCreateTag}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {filteredTags.map((tag) => (
                <div
                  key={tag}
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer",
                    selectedTags.includes(tag) && "text-primary"
                  )}
                  onClick={() => handleTagSelect(tag)}
                >
                  <span>{tag}</span>
                  {selectedTags.includes(tag) && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 bg-accent/50 text-accent-foreground px-2 py-1 rounded-md text-sm"
            >
              <span>{tag}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleTagRemove(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}