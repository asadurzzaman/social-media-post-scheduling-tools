import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { publishPost } from "@/utils/postPublisher";
import { usePostFormState } from "./usePostFormState";
import { PostFormState } from "../types/PostFormTypes";
import { useUser } from "@/hooks/useUser";

export const usePostForm = (
  initialPost?: any,
  initialDate?: Date,
  onSuccess?: () => void
) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { formState, setters } = usePostFormState(initialPost, initialDate);

  const handlePublishNow = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to publish posts");
      return;
    }

    try {
      await publishPost({
        content: formState.content,
        selectedAccount: formState.selectedAccount,
        userId: user.id,
        postType: formState.postType,
        uploadedFiles: formState.uploadedFiles,
        pollOptions: formState.pollOptions,
        timezone: formState.timezone,
      });
      
      toast.success("Post published successfully!");
      setters.setContent("");
      setters.setSelectedAccount("");
      setters.setDate(undefined);
      setters.setPostType("text");
      setters.setUploadedFiles([]);
      setters.setPreviewUrls([]);
      setters.setPollOptions([
        { id: crypto.randomUUID(), text: "" },
        { id: crypto.randomUUID(), text: "" }
      ]);
      localStorage.removeItem('postDraft');
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
    
    if (!user?.id) {
      toast.error("You must be logged in to schedule posts");
      return;
    }

    if (!formState.date) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      await publishPost({
        content: formState.content,
        selectedAccount: formState.selectedAccount,
        userId: user.id,
        postType: formState.postType,
        uploadedFiles: formState.uploadedFiles,
        pollOptions: formState.pollOptions,
        timezone: formState.timezone,
        scheduledFor: formState.date,
        postId: initialPost?.id,
      });
      
      toast.success(initialPost ? "Post updated successfully!" : "Post scheduled successfully!");
      setters.setContent("");
      setters.setSelectedAccount("");
      setters.setDate(undefined);
      setters.setPostType("text");
      setters.setUploadedFiles([]);
      setters.setPreviewUrls([]);
      setters.setPollOptions([
        { id: crypto.randomUUID(), text: "" },
        { id: crypto.randomUUID(), text: "" }
      ]);
      localStorage.removeItem('postDraft');
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
      content: formState.content,
      postType: formState.postType,
      selectedAccount: formState.selectedAccount,
      date: formState.date?.toISOString(),
      timezone: formState.timezone,
      pollOptions: formState.postType === 'poll' ? formState.pollOptions : undefined
    };
    localStorage.setItem('postDraft', JSON.stringify(draft));
    setters.setIsDraft(true);
    toast.success("Draft saved successfully!");
  };

  const clearDraft = () => {
    setters.setContent("");
    setters.setSelectedAccount("");
    setters.setDate(undefined);
    setters.setPostType("text");
    setters.setUploadedFiles([]);
    setters.setPreviewUrls([]);
    setters.setPollOptions([
      { id: crypto.randomUUID(), text: "" },
      { id: crypto.randomUUID(), text: "" }
    ]);
    localStorage.removeItem('postDraft');
    setters.setIsDraft(false);
    toast.success("Draft cleared successfully!");
  };

  return {
    ...formState,
    ...setters,
    handleSubmit,
    handlePublishNow,
    handleSaveDraft,
    clearDraft
  };
};