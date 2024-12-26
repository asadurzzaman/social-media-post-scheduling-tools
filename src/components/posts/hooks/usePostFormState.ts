import { useState, useEffect } from 'react';
import { PostType } from '../PostTypeSelect';
import { PollOption, PostFormState } from '../types/PostFormTypes';

const defaultPollOptions = [
  { id: crypto.randomUUID(), text: "" },
  { id: crypto.randomUUID(), text: "" }
];

export const usePostFormState = (initialPost?: any, initialDate?: Date) => {
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

  return {
    formState: {
      content,
      selectedAccount,
      date,
      timezone,
      postType,
      uploadedFiles,
      previewUrls,
      isDraft,
      pollOptions,
    },
    setters: {
      setContent,
      setSelectedAccount,
      setDate,
      setTimezone,
      setPostType,
      setUploadedFiles,
      setPreviewUrls,
      setPollOptions,
    }
  };
};