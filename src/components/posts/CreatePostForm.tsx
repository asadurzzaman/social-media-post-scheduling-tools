import { PostType } from './PostTypeSelect';
import { CreatePostFormContent } from "./CreatePostFormContent";
import { usePostForm } from './usePostForm';

interface CreatePostFormProps {
  accounts: any[];
  userId: string | null;
  initialDate?: Date;
  initialPost?: any;
  onSuccess?: () => void;
}

export const CreatePostForm = ({ 
  accounts, 
  userId, 
  initialDate,
  initialPost,
  onSuccess 
}: CreatePostFormProps) => {
  const form = usePostForm(initialPost, initialDate, onSuccess);

  return (
    <CreatePostFormContent
      accounts={accounts}
      content={form.content}
      setContent={form.setContent}
      selectedAccount={form.selectedAccount}
      setSelectedAccount={form.setSelectedAccount}
      date={form.date}
      setDate={form.setDate}
      postType={form.postType}
      setPostType={form.setPostType}
      uploadedFiles={form.uploadedFiles}
      setUploadedFiles={form.setUploadedFiles}
      previewUrls={form.previewUrls}
      setPreviewUrls={form.setPreviewUrls}
      isDraft={form.isDraft}
      onSubmit={form.handleSubmit}
      clearDraft={form.clearDraft}
      pollOptions={form.pollOptions}
      setPollOptions={form.setPollOptions}
      timezone={form.timezone}
      onTimezoneChange={form.setTimezone}
      onPublishNow={form.handlePublishNow}
      onSaveDraft={form.handleSaveDraft}
    />
  );
};