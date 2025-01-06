import { useState, useEffect } from "react";
import { PostType } from './PostTypeSelect';
import { toast } from "sonner";
import { CreatePostFormContent } from "./CreatePostFormContent";
import { useNavigate } from "react-router-dom";
import { publishPost } from "@/utils/postPublisher";

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
  const [content, setContent] = useState(initialPost?.content || "");
  const [selectedAccount, setSelectedAccount] = useState(initialPost?.social_account_id || "");
  const [date, setDate] = useState<Date | undefined>(initialPost ? new Date(initialPost.scheduled_for) : initialDate);
  const [timezone, setTimezone] = useState<string>(initialPost?.timezone || "UTC");
  const [postType, setPostType] = useState<PostType>("text");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialPost?.image_url ? [initialPost.image_url] : []);
  const [isDraft, setIsDraft] = useState(false);

  const resetForm = () => {
    setContent("");
    setSelectedAccount("");
    setDate(undefined);
    setPostType("text");
    setUploadedFiles([]);
    setPreviewUrls([]);
    setIsDraft(false);
    localStorage.removeItem('postDraft');
  };

  useEffect(() => {
    if (!initialPost) {
      const savedDraft = localStorage.getItem('postDraft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setContent(draft.content || "");
        setPostType(draft.postType || "text");
        setSelectedAccount(draft.selectedAccount || "");
        if (draft.date) setDate(new Date(draft.date));
        if (draft.timezone) setTimezone(draft.timezone);
      }
    }
  }, [initialPost]);

  useEffect(() => {
    if (!initialPost && (content || selectedAccount || date || postType !== "text")) {
      const draft = {
        content,
        postType,
        selectedAccount,
        date: date?.toISOString(),
        timezone,
      };
      localStorage.setItem('postDraft', JSON.stringify(draft));
      setIsDraft(true);
    }
  }, [content, postType, selectedAccount, date, timezone, initialPost]);

  const handleSaveDraft = () => {
    const draft = {
      content,
      postType,
      selectedAccount,
      date: date?.toISOString(),
      timezone,
    };
    localStorage.setItem('postDraft', JSON.stringify(draft));
    setIsDraft(true);
    toast.success("Draft saved successfully!");
  };

  const clearDraft = () => {
    resetForm();
    toast.success("Draft cleared successfully!");
  };

  const handlePublishNow = async () => {
    try {
      await publishPost({
        content,
        selectedAccount,
        userId: userId!,
        postType,
        uploadedFiles,
        timezone,
      });
      
      toast.success("Post published successfully!");
      resetForm();
      onSuccess?.();
      if (!onSuccess) navigate('/posts');
    } catch (error: any) {
      console.error("Error publishing post:", error);
      toast.error(error.message || "Failed to publish post");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      await publishPost({
        content,
        selectedAccount,
        userId: userId!,
        postType,
        uploadedFiles,
        timezone,
        scheduledFor: date,
        postId: initialPost?.id,
      });
      
      toast.success(initialPost ? "Post updated successfully!" : "Post scheduled successfully!");
      resetForm();
      onSuccess?.();
      if (!onSuccess) navigate('/posts');
    } catch (error: any) {
      console.error("Error scheduling post:", error);
      toast.error(error.message || "Failed to schedule post");
    }
  };

  return (
    <CreatePostFormContent
      accounts={accounts}
      content={content}
      setContent={setContent}
      selectedAccount={selectedAccount}
      setSelectedAccount={setSelectedAccount}
      date={date}
      setDate={setDate}
      postType={postType}
      setPostType={setPostType}
      uploadedFiles={uploadedFiles}
      setUploadedFiles={setUploadedFiles}
      previewUrls={previewUrls}
      setPreviewUrls={setPreviewUrls}
      isDraft={isDraft}
      onSubmit={handleSubmit}
      clearDraft={clearDraft}
      timezone={timezone}
      onTimezoneChange={setTimezone}
      onPublishNow={handlePublishNow}
      onSaveDraft={handleSaveDraft}
      initialPost={initialPost}
    />
  );
};