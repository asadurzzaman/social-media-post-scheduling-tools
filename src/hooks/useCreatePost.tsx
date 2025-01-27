import { useState, useEffect } from "react";
import { PostType } from '@/components/posts/PostTypeSelect';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { publishPost } from "@/utils/postPublisher";
import { supabase } from "@/integrations/supabase/client";

export const useCreatePost = (
  userId: string | null,
  initialPost?: any,
  initialDate?: Date,
  onSuccess?: () => void
) => {
  const navigate = useNavigate();
  const [content, setContent] = useState(initialPost?.content || "");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    initialPost ? [initialPost.social_account_id] : []
  );
  const [date, setDate] = useState<Date | undefined>(
    initialPost ? new Date(initialPost.scheduled_for) : initialDate
  );
  const [timezone, setTimezone] = useState<string>(initialPost?.timezone || "UTC");
  const [postType, setPostType] = useState<PostType>("text");
  const [isDraft, setIsDraft] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

  const validateSelectedAccount = async (accountId: string) => {
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error || !account) {
      toast.error("Selected social account is not valid. Please reconnect your account.");
      navigate('/add-account');
      return false;
    }

    if (account.requires_reconnect) {
      toast.error("Your social account needs to be reconnected");
      navigate('/add-account');
      return false;
    }

    return true;
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload image: ${file.name}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
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

    // Validate the selected account exists and is properly connected
    const isValid = await validateSelectedAccount(selectedAccounts[0]);
    if (!isValid) return;

    try {
      const imageUrls = selectedFiles.length > 0 ? await uploadImages() : [];

      for (const accountId of selectedAccounts) {
        await publishPost({
          content,
          selectedAccount: accountId,
          userId,
          postType,
          timezone,
          imageUrls,
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

    // Validate the selected account exists and is properly connected
    const isValid = await validateSelectedAccount(selectedAccounts[0]);
    if (!isValid) return;

    try {
      const imageUrls = selectedFiles.length > 0 ? await uploadImages() : [];

      for (const accountId of selectedAccounts) {
        await publishPost({
          content,
          selectedAccount: accountId,
          userId,
          postType,
          timezone,
          scheduledFor: date,
          postId: initialPost?.id,
          imageUrls,
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

  const resetForm = () => {
    setContent("");
    setSelectedAccounts([]);
    setDate(undefined);
    setPostType("text");
    setIsDraft(false);
    setSelectedFiles([]);
    localStorage.removeItem('postDraft');
  };

  const handleDeleteImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return {
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
  };
};