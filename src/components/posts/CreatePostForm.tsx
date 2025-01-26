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
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    initialPost ? [initialPost.social_account_id] : []
  );
  const [date, setDate] = useState<Date | undefined>(initialPost ? new Date(initialPost.scheduled_for) : initialDate);
  const [timezone, setTimezone] = useState<string>(initialPost?.timezone || "UTC");
  const [postType, setPostType] = useState<PostType>("text");
  const [isDraft, setIsDraft] = useState(false);

  // Check for user authentication at component mount
  useEffect(() => {
    if (!userId) {
      toast.error("Please log in to create posts");
      navigate('/auth');
    }
  }, [userId, navigate]);

  const resetForm = () => {
    setContent("");
    setSelectedAccounts([]);
    setDate(undefined);
    setPostType("text");
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
        setSelectedAccounts(draft.selectedAccounts || []);
        if (draft.date) setDate(new Date(draft.date));
        if (draft.timezone) setTimezone(draft.timezone);
      }
    }
  }, [initialPost]);

  useEffect(() => {
    if (!initialPost && (content || selectedAccounts.length > 0 || date)) {
      const draft = {
        content,
        postType,
        selectedAccounts,
        date: date?.toISOString(),
        timezone
      };
      localStorage.setItem('postDraft', JSON.stringify(draft));
      setIsDraft(true);
    }
  }, [content, postType, selectedAccounts, date, timezone, initialPost]);

  const handleSaveDraft = () => {
    if (!userId) {
      toast.error("Please log in to save drafts");
      navigate('/auth');
      return;
    }

    const draft = {
      content,
      postType,
      selectedAccounts,
      date: date?.toISOString(),
      timezone
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
    if (!userId) {
      toast.error("Please log in to publish posts");
      navigate('/auth');
      return;
    }

    if (selectedAccounts.length === 0) {
      toast.error("Please select at least one social media account");
      return;
    }

    try {
      for (const accountId of selectedAccounts) {
        await publishPost({
          content,
          selectedAccount: accountId,
          userId,
          postType,
          timezone,
        });
      }
      
      toast.success("Posts published successfully!");
      resetForm();
      onSuccess?.();
      if (!onSuccess) navigate('/posts');
    } catch (error: any) {
      console.error("Error publishing posts:", error);
      toast.error(error.message || "Failed to publish posts");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Please log in to schedule posts");
      navigate('/auth');
      return;
    }

    if (!date) {
      toast.error("Please select a date and time");
      return;
    }

    if (selectedAccounts.length === 0) {
      toast.error("Please select at least one social media account");
      return;
    }

    try {
      for (const accountId of selectedAccounts) {
        await publishPost({
          content,
          selectedAccount: accountId,
          userId,
          postType,
          timezone,
          scheduledFor: date,
          postId: initialPost?.id,
        });
      }
      
      toast.success(initialPost ? "Posts updated successfully!" : "Posts scheduled successfully!");
      resetForm();
      onSuccess?.();
      if (!onSuccess) navigate('/posts');
    } catch (error: any) {
      console.error("Error scheduling posts:", error);
      toast.error(error.message || "Failed to schedule posts");
    }
  };

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
      clearDraft={clearDraft}
      timezone={timezone}
      onTimezoneChange={setTimezone}
      onPublishNow={handlePublishNow}
      onSaveDraft={handleSaveDraft}
      initialPost={initialPost}
    />
  );
};