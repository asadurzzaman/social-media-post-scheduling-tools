import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText } from "lucide-react";

export const POST_TYPES = [
  { value: "text", label: "Text Post", icon: FileText },
] as const;

export type PostType = typeof POST_TYPES[number]['value'];

interface PostTypeSelectProps {
  value: PostType;
  onChange: (value: PostType) => void;
}

export const PostTypeSelect = ({ value, onChange }: PostTypeSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Post Type <span className="text-red-500">*</span>
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select post type">
            {POST_TYPES.find(type => type.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {POST_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <SelectItem 
                key={type.value} 
                value={type.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};