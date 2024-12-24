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
      clearDraft();
      navigate('/posts');
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
        pollOptions,
        timezone,
        scheduledFor: date,
      });
      
      toast.success("Post scheduled successfully!");
      clearDraft();
      navigate('/posts');
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
      pollOptions={pollOptions}
      setPollOptions={setPollOptions}
      timezone={timezone}
      onTimezoneChange={setTimezone}
      onPublishNow={handlePublishNow}
    />
  );
};
