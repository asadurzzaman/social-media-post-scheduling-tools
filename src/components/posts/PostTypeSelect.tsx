export type PostType = "text";

interface PostTypeSelectProps {
  value: PostType;
  onChange: (type: PostType) => void;
}

export const PostTypeSelect = ({ value, onChange }: PostTypeSelectProps) => {
  // Since we only have text posts now, we can return null
  return null;
};