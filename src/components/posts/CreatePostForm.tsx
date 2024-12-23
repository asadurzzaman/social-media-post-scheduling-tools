import { useState, useEffect } from "react";
import { PostType } from './PostTypeSelect';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreatePostFormContent } from "./CreatePostFormContent";

interface CreatePostFormProps {
  accounts: any[];
  userId: string | null;
}

export const CreatePostForm = ({ accounts, userId }: CreatePostFormProps) => {
  const [content, setContent] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [date, setDate] = useState<Date>();
  const [postType, setPostType] = useState<PostType>("text");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [pollOptions, setPollOptions] = useState([
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" }
  ]);
  
  // Recurring post states
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("daily");
  const [intervalValue, setIntervalValue] = useState(1);
  const [endDate, setEndDate] = useState<Date>();
  const [customIntervalHours, setCustomIntervalHours] = useState(24);

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('postDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setContent(draft.content || "");
      setPostType(draft.postType || "text");
      setSelectedAccount(draft.selectedAccount || "");
      setHashtags(draft.hashtags || []);
      if (draft.date) setDate(new Date(draft.date));
      if (draft.pollOptions) setPollOptions(draft.pollOptions);
    }
  }, []);

  // Save draft to localStorage when content changes
  useEffect(() => {
    if (content || selectedAccount || date || postType !== "text" || hashtags.length > 0 || pollOptions.some(opt => opt.text)) {
      const draft = {
        content,
        postType,
        selectedAccount,
        date: date?.toISOString(),
        hashtags,
        pollOptions: postType === 'poll' ? pollOptions : undefined
      };
      localStorage.setItem('postDraft', JSON.stringify(draft));
      setIsDraft(true);
    }
  }, [content, postType, selectedAccount, date, hashtags, pollOptions]);

  const clearDraft = () => {
    localStorage.removeItem('postDraft');
    setContent("");
    setSelectedAccount("");
    setDate(undefined);
    setPostType("text");
    setUploadedFiles([]);
    setPreviewUrls([]);
    setHashtags([]);
    setPollOptions([
      { id: crypto.randomUUID(), text: "" },
      { id: crypto.randomUUID(), text: "" }
    ]);
    setIsDraft(false);
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

      const postData = {
        content,
        social_account_id: selectedAccount,
        image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
        hashtags,
        user_id: userId,
        poll_options: postType === 'poll' ? pollOptions.map(opt => opt.text) : null
      };

      if (isRecurring) {
        const { error } = await supabase.from("recurring_posts").insert({
          ...postData,
          start_date: date.toISOString(),
          end_date: endDate?.toISOString(),
          frequency,
          interval_value: intervalValue,
          custom_interval_hours: frequency === 'custom' ? customIntervalHours : null,
          status: "active"
        });

        if (error) throw error;
        toast.success("Recurring post scheduled successfully!");
      } else {
        const { error } = await supabase.from("posts").insert({
          ...postData,
          scheduled_for: date.toISOString(),
          status: "scheduled",
        });

        if (error) throw error;
        toast.success("Post scheduled successfully!");
      }

      clearDraft();
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
      hashtags={hashtags}
      setHashtags={setHashtags}
      isRecurring={isRecurring}
      setIsRecurring={setIsRecurring}
      frequency={frequency}
      setFrequency={setFrequency}
      intervalValue={intervalValue}
      setIntervalValue={setIntervalValue}
      endDate={endDate}
      setEndDate={setEndDate}
      customIntervalHours={customIntervalHours}
      setCustomIntervalHours={setCustomIntervalHours}
      onSubmit={handleSubmit}
      clearDraft={clearDraft}
      pollOptions={pollOptions}
      setPollOptions={setPollOptions}
    />
  );
};