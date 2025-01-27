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
    if (!userId) {
      toast.error("Please log in to create posts");
      navigate('/auth');
    }
  }, [userId, navigate]);

  useEffect(() => {
    // Create preview URLs for selected files
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup function to revoke object URLs
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

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

  const handleDeleteImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];
    
    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Failed to upload image');
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
    resetForm: () => {
      resetForm();
      toast.success("Draft cleared successfully!");
    },
    selectedFiles,
    setSelectedFiles,
    previewUrls,
    handleDeleteImage
  };
};