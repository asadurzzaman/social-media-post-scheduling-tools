import { MediaUpload } from "./MediaUpload";
import { PollOptions } from "./PollOptions";
import { PostType } from "./PostTypeSelect";

interface PostFormMediaProps {
  postType: PostType;
  uploadedFiles: File[];
  previewUrls: string[];
  onFileUpload: (files: File[]) => void;
  onFileDelete: (index: number) => void;
  pollOptions?: { id: string; text: string; }[];
  onPollOptionsChange?: (options: { id: string; text: string; }[]) => void;
}

export const PostFormMedia = ({
  postType,
  uploadedFiles,
  previewUrls,
  onFileUpload,
  onFileDelete,
  pollOptions,
  onPollOptionsChange
}: PostFormMediaProps) => {
  if (postType === "poll" && onPollOptionsChange && pollOptions) {
    return (
      <PollOptions
        options={pollOptions}
        onChange={onPollOptionsChange}
      />
    );
  }

  return (
    <MediaUpload
      postType={postType}
      uploadedFiles={uploadedFiles}
      previewUrls={previewUrls}
      onFileUpload={onFileUpload}
      onFileDelete={onFileDelete}
    />
  );
};