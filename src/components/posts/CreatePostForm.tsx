import { useState, useEffect } from "react";
import { PostType } from './PostTypeSelect';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreatePostFormContent } from "./CreatePostFormContent";
import { useNavigate } from "react-router-dom";

interface CreatePostFormProps {
  accounts: any[];
  userId: string | null;
  initialDate?: Date;
}

interface PollOption {
  id: string;
  text: string;
}

export const CreatePostForm = ({ accounts, userId, initialDate }: CreatePostFormProps) => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [postType, setPostType] = useState<PostType>("text");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" }
  ]);

  // Load draft from localStorage on component mount
  useEffect(() => {
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
  }, []);

  // Save draft to localStorage when content changes
  useEffect(() => {
    if (content || selectedAccount || date || postType !== "text" || pollOptions.some(opt => opt.text)) {
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
  }, [content, postType, selectedAccount, date, timezone, pollOptions]);

  const clearDraft = () => {
    localStorage.removeItem('postDraft');
    setContent("");
    setSelectedAccount("");
    setDate(undefined);
    setPostType("text");
    setUploadedFiles([]);
    setPreviewUrls([]);
    setPollOptions([
      { id: crypto.randomUUID(), text: "" },
      { id: crypto.randomUUID(), text: "" }
    ]);
    setIsDraft(false);
  };

  const handlePublishNow = async () => {
    if (!content || !selectedAccount || !userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (["image", "carousel", "video"].includes(postType) && uploadedFiles.length === 0) {
      toast.error(`Please upload ${postType === 'carousel' ? 'at least one image' : `1 ${postType}`}`);
      return;
    }

    if (postType === 'poll' && !pollOptions.every(opt => opt.text.trim())) {
      toast.error("Please fill in all poll options");
      return;
    }

    try {
      let imageUrls: string[] = [];
      
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      // Insert the post with current timestamp
      const { error } = await supabase.from("posts").insert({
        content,
        social_account_id: selectedAccount,
        image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
        user_id: userId,
        scheduled_for: new Date().toISOString(), // Use current time
        status: "scheduled", // The edge function will pick this up immediately
        timezone: timezone,
        poll_options: postType === 'poll' ? pollOptions.map(opt => opt.text) : null
      });

      if (error) throw error;

      // Trigger immediate publishing
      const { error: publishError } = await supabase.functions.invoke('publish-facebook-post');
      
      if (publishError) throw publishError;
      
      toast.success("Post published successfully!");
      clearDraft();
      navigate('/posts');
    } catch (error) {
      console.error("Error publishing post:", error);
      toast.error("Failed to publish post");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !selectedAccount || !date || !userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (["image", "carousel", "video"].includes(postType) && uploadedFiles.length === 0) {
      toast.error(`Please upload ${postType === 'carousel' ? 'at least one image' : `1 ${postType}`}`);
      return;
    }

    if (postType === 'poll' && !pollOptions.every(opt => opt.text.trim())) {
      toast.error("Please fill in all poll options");
      return;
    }

    try {
      let imageUrls: string[] = [];
      
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      const { error } = await supabase.from("posts").insert({
        content,
        social_account_id: selectedAccount,
        image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
        user_id: userId,
        scheduled_for: date.toISOString(),
        status: "scheduled",
        timezone: timezone,
        poll_options: postType === 'poll' ? pollOptions.map(opt => opt.text) : null
      });

      if (error) throw error;
      
      toast.success("Post scheduled successfully!");
      clearDraft();
      navigate('/posts');
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post");
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
      pollOptions={pollOptions}
      setPollOptions={setPollOptions}
      timezone={timezone}
      onTimezoneChange={setTimezone}
      onPublishNow={handlePublishNow}
    />
  );
};
