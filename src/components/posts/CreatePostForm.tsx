import { CreatePostFormContent } from "./CreatePostFormContent";
import { useCreatePost } from "@/hooks/useCreatePost";

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
  const {
    content,
    setContent,
    selectedAccounts,
    setSelectedAccounts,
    date,
    setDate,
    timezone,
    setTimezone,
    postType,
    setPostType,
    isDraft,
    handleSaveDraft,
    handlePublishNow,
    handleSubmit,
    resetForm
  } = useCreatePost(userId, initialPost, initialDate, onSuccess);

  // If there's no userId, don't render the form
  if (!userId) {
    return null;
  }

  return (
    <CreatePostFormContent
      accounts={accounts}
      content={content}
      setContent={setContent}
      selectedAccounts={selectedAccounts}
      setSelectedAccounts={setSelectedAccounts}
      date={date}
      setDate={setDate}
      postType={postType}
      setPostType={setPostType}
      isDraft={isDraft}
      onSubmit={handleSubmit}
      clearDraft={resetForm}
      timezone={timezone}
      onTimezoneChange={setTimezone}
      onPublishNow={handlePublishNow}
      onSaveDraft={handleSaveDraft}
      initialPost={initialPost}
    />
  );
};