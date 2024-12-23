import { useState, useEffect } from "react";
import { PostTypeSelect, PostType } from './PostTypeSelect';
import { SocialAccountList } from './SocialAccountList';
import { RichTextEditor } from './RichTextEditor';
import { SchedulingOptions } from './SchedulingOptions';
import { PostFormMedia } from './PostFormMedia';
import { PostFormActions } from './PostFormActions';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    }
  }, []);

  // Save draft to localStorage when content changes
  useEffect(() => {
    if (content || selectedAccount || date || postType !== "text" || hashtags.length > 0) {
      const draft = {
        content,
        postType,
        selectedAccount,
        date: date?.toISOString(),
        hashtags
      };
      localStorage.setItem('postDraft', JSON.stringify(draft));
      setIsDraft(true);
    }
  }, [content, postType, selectedAccount, date, hashtags]);

  const handleFileUpload = (files: File[]) => {
    if (postType === 'carousel') {
      setUploadedFiles(prev => [...prev, ...files]);
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } else {
      setUploadedFiles([files[0]]);
      const objectUrl = URL.createObjectURL(files[0]);
      setPreviewUrls([objectUrl]);
    }
  };

  const handleFileDelete = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearDraft = () => {
    localStorage.removeItem('postDraft');
    setContent("");
    setSelectedAccount("");
    setDate(undefined);
    setPostType("text");
    setUploadedFiles([]);
    setPreviewUrls([]);
    setHashtags([]);
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

      if (isRecurring) {
        const { error } = await supabase.from("recurring_posts").insert({
          content,
          social_account_id: selectedAccount,
          start_date: date.toISOString(),
          end_date: endDate?.toISOString(),
          image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
          hashtags,
          frequency,
          interval_value: intervalValue,
          custom_interval_hours: frequency === 'custom' ? customIntervalHours : null,
          user_id: userId,
          status: "active"
        });

        if (error) throw error;
        toast.success("Recurring post scheduled successfully!");
      } else {
        const { error } = await supabase.from("posts").insert({
          content,
          social_account_id: selectedAccount,
          scheduled_for: date.toISOString(),
          image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
          hashtags,
          status: "scheduled",
          user_id: userId
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
    <div className="space-y-6 max-w-2xl">
      <SocialAccountList
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelect={setSelectedAccount}
      />

      <PostTypeSelect 
        value={postType} 
        onChange={setPostType} 
      />

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Post Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          maxLength={2200}
          hashtags={hashtags}
          onHashtagsChange={setHashtags}
        />
      </div>

      <PostFormMedia
        postType={postType}
        uploadedFiles={uploadedFiles}
        previewUrls={previewUrls}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
      />

      <SchedulingOptions
        date={date}
        onDateChange={setDate}
        isRecurring={isRecurring}
        onRecurringChange={setIsRecurring}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        intervalValue={intervalValue}
        onIntervalValueChange={setIntervalValue}
        endDate={endDate}
        onEndDateChange={setEndDate}
        customIntervalHours={customIntervalHours}
        onCustomIntervalChange={setCustomIntervalHours}
      />

      <PostFormActions
        onSubmit={handleSubmit}
        isRecurring={isRecurring}
        isDraft={isDraft}
        onClearDraft={clearDraft}
      />
    </div>
  );
};