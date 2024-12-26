import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Image, Film, Link2, BarChart2, History } from "lucide-react";

export const POST_TYPES = [
  { value: "text", label: "Text Post", icon: FileText },
  { value: "image", label: "Photo", icon: Image },
  { value: "carousel", label: "Photo Album", icon: Image },
  { value: "video", label: "Video", icon: Film },
  { value: "link", label: "Link with Preview", icon: Link2 },
  { value: "poll", label: "Poll", icon: BarChart2 },
  { value: "story", label: "Story", icon: History },
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
            <div className="flex items-center gap-2">
              {POST_TYPES.find(type => type.value === value)?.icon && (
                <span className="inline-block w-4 h-4">
                  {React.createElement(POST_TYPES.find(type => type.value === value)?.icon || FileText)}
                </span>
              )}
              {POST_TYPES.find(type => type.value === value)?.label}
            </div>
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