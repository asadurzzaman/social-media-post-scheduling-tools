import { Button } from "@/components/ui/button";
import { FileText, Image } from "lucide-react";

export type PostType = "text" | "image";

interface PostTypeSelectProps {
  value: PostType;
  onChange: (type: PostType) => void;
}

export const PostTypeSelect = ({ value, onChange }: PostTypeSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Post Type <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={value === "text" ? "default" : "outline"}
          onClick={() => onChange("text")}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Text Post
        </Button>
        <Button
          type="button"
          variant={value === "image" ? "default" : "outline"}
          onClick={() => onChange("image")}
          className="flex-1"
        >
          <Image className="w-4 h-4 mr-2" />
          Image Post
        </Button>
      </div>
    </div>
  );
};