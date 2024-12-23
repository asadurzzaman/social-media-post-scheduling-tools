import { MediaUpload } from './MediaUpload';
import { PostType } from './PostTypeSelect';

interface PostFormMediaProps {
  postType: PostType;
  uploadedFiles: File[];
  previewUrls: string[];
  onFileUpload: (files: File[]) => void;
  onFileDelete: (index: number) => void;
}

export const PostFormMedia = ({
  postType,
  uploadedFiles,
  previewUrls,
  onFileUpload,
  onFileDelete
}: PostFormMediaProps) => {
  if (!["image", "carousel", "video"].includes(postType)) {
    return null;
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