import { useState, useEffect } from "react";
import { PostType } from './PostTypeSelect';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { publishPost } from "@/utils/postPublisher";

interface PollOption {
  id: string;
  text: string;
}

const defaultPollOptions = [
  { id: crypto.randomUUID(), text: "" },
  { id: crypto.randomUUID(), text: "" }
];

export const usePostForm = (
  initialPost?: any,
  initialDate?: Date,
  onSuccess?: () => void
) => {
  const navigate = useNavigate();
  const [content, setContent] = useState(initialPost?.content || "");
  const [selectedAccount, setSelectedAccount] = useState(initialPost?.social_account_id || "");
  const [date, setDate] = useState<Date | undefined>(
    initialPost ? new Date(initialPost.scheduled_for) : initialDate
  );
  const [timezone, setTimezone] = useState<string>(initialPost?.timezone || "UTC");
  const [postType, setPostType] = useState<PostType>(() => {
    if (initialPost) {
      if (initialPost.poll_options?.length > 0) return "poll";
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
  const [pollOptions, setPollOptions] = useState<PollOption[]>(
    initialPost?.poll_options?.length > 0
      ? initialPost.poll_options.map((text: string) => ({ 
          id: crypto.randomUUID(), 
          text 
        }))
      : defaultPollOptions
  );

  const resetForm = () => {
    setContent("");
    setSelectedAccount("");
    setDate(undefined);
    setPostType("text");
    setUploadedFiles([]);
    setPreviewUrls([]);
    setPollOptions(defaultPollOptions);
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
        if (draft.pollOptions) setPollOptions(draft.pollOptions);
      }
    }
  }, [initialPost]);

  useEffect(() => {
    if (!initialPost && (content || selectedAccount || date || postType !== "text" || pollOptions.some(opt => opt.text))) {
      const draft = {
        content,
        postType,
        selectedAccount,
        date: date?.toISOString(),
        timezone,
        pollOptions: postType === 'poll' ? pollOptions : undefined
      };
      localStorage.setItem('postDraft', JSON.stringify(draft));
      setIsDraft(true);
    }
  }, [content, postType, selectedAccount, date, timezone, pollOptions, initialPost]);

  const handlePublishNow = async () => {
    try {
      await publishPost({
        content,
        selectedAccount,
        userId: userId!,
        postType,
        uploadedFiles,
        pollOptions,
        timezone,
      });
      
      toast.success("Post published successfully!");
      resetForm();
      onSuccess?.();
      if (!onSuccess) navigate('/posts');
    } catch (error: any) {
      console.error("Error publishing post:", error);
      if (error.message?.includes('TOKEN_EXPIRED')) {
        toast.error("Your Facebook session has expired. Please reconnect your account.", {
          action: {
            label: "Reconnect",
            onClick: () => navigate('/add-account')
          }
        });
      } else {
        toast.error(error.message || "Failed to publish post");
      }
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
        pollOptions,
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
      if (error.message?.includes('TOKEN_EXPIRED')) {
        toast.error("Your Facebook session has expired. Please reconnect your account.", {
          action: {
            label: "Reconnect",
            onClick: () => navigate('/add-account')
          }
        });
      } else {
        toast.error(error.message || "Failed to schedule post");
      }
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      content,
      postType,
      selectedAccount,
      date: date?.toISOString(),
      timezone,
      pollOptions: postType === 'poll' ? pollOptions : undefined
    };
    localStorage.setItem('postDraft', JSON.stringify(draft));
    setIsDraft(true);
    toast.success("Draft saved successfully!");
  };

  const clearDraft = () => {
    resetForm();
    toast.success("Draft cleared successfully!");
  };

  return {
    content,
    setContent,
    selectedAccount,
    setSelectedAccount,
    date,
    setDate,
    timezone,
    setTimezone,
    postType,
    setPostType,
    uploadedFiles,
    setUploadedFiles,
    previewUrls,
    setPreviewUrls,
    isDraft,
    pollOptions,
    setPollOptions,
    handleSubmit,
    handlePublishNow,
    handleSaveDraft,
    clearDraft
  };
};