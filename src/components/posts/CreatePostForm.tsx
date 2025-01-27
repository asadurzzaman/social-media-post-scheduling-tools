import { CreatePostFormContent } from "./CreatePostFormContent";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    // Validate that there are connected accounts
    if (accounts.length === 0) {
      toast.error("Please connect a social media account first");
      navigate("/add-account");
      return;
    }
  }, [accounts, navigate]);

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
    resetForm,
    selectedFiles,
    setSelectedFiles,
    previewUrls,
    handleDeleteImage
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
      selectedFiles={selectedFiles}
      onFilesSelected={setSelectedFiles}
      previewUrls={previewUrls}
      onDeleteImage={handleDeleteImage}
    />
  );
};