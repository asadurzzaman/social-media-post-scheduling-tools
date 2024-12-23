import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const POST_TYPES = [
  { value: "image", label: "Image" },
  { value: "carousel", label: "Carousel" },
  { value: "video", label: "Video" },
  { value: "text-only", label: "Text-only" },
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
        <SelectTrigger>
          <SelectValue placeholder="Select post type" />
        </SelectTrigger>
        <SelectContent>
          {POST_TYPES.map((type) => (
            <SelectItem 
              key={type.value} 
              value={type.value}
              className="cursor-pointer"
            >
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};