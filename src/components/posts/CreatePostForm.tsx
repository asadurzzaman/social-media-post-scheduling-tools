import { useState, useEffect } from "react";
import { PostType } from './PostTypeSelect';
import { toast } from "sonner";
import { CreatePostFormContent } from "./CreatePostFormContent";
import { useNavigate } from "react-router-dom";
import { publishPost } from "@/utils/postPublisher";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostFormProps {
  accounts: any[];
  userId: string | null;
  initialDate?: Date;
  initialPost?: any;
  onSuccess?: () => void;
}

export const CreatePostForm = ({ 
  accounts, 
  initialDate,
  initialPost,
  onSuccess 
}: CreatePostFormProps) => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [content, setContent] = useState(initialPost?.content || "");
  const [selectedAccount, setSelectedAccount] = useState(initialPost?.social_account_id || "");
  const [date, setDate] = useState<Date | undefined>(initialPost ? new Date(initialPost.scheduled_for) : initialDate);
  const [timezone, setTimezone] = useState<string>(initialPost?.timezone || "UTC");
  const [postType, setPostType] = useState<PostType>(() => {
    if (initialPost) {
      if (initialPost.image_url) {
        const isVideo = initialPost.image_url.match(/\.(mp4|mov)$/i);
        return isVideo ? "video" : "image";
      }
      return "text";
    }
    return "text";
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(() => {
    if (initialPost?.image_url) {
      return [initialPost.image_url];
    }
    return [];
  });
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

  const handlePublishError = async (error: any) => {
    console.error("Error publishing post:", error);
    
    const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
    const errorMessage = errorBody?.error || error.message;
    
    if (errorMessage?.includes("token has expired")) {
      await supabase
        .from('social_accounts')
        .update({ 
          requires_reconnect: true,
          last_error: errorMessage
        })
        .eq('id', selectedAccount);
      
      toast.error("Social media token has expired. Please reconnect your account.");
    } else {
      toast.error(errorMessage || "Failed to publish post");
    }
  };

  const handlePublishNow = async () => {
    if (!userId) {
      toast.error("You must be logged in to publish a post");
      return;
    }

    try {
      await publishPost({
        content,
        selectedAccount,
        userId,
        postType,
        uploadedFiles,
        timezone,
      });
      
      toast.success("Post published successfully!");
      resetForm();
      onSuccess?.();
      if (!onSuccess) navigate('/posts');
    } catch (error: any) {
      handlePublishError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("You must be logged in to schedule a post");
      return;
    }

    if (!date) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      await publishPost({
        content,
        selectedAccount,
        userId,
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
      handlePublishError(error);
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