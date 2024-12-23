import { useState } from "react";
import { PostTypeSelect, PostType } from './PostTypeSelect';
import { SocialAccountList } from './SocialAccountList';
import { RichTextEditor } from './RichTextEditor';
import { SchedulingOptions } from './SchedulingOptions';
import { PostFormMedia } from './PostFormMedia';
import { PostFormActions } from './PostFormActions';

interface PollOption {
  id: string;
  text: string;
}

interface CreatePostFormContentProps {
  accounts: any[];
  content: string;
  setContent: (content: string) => void;
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  postType: PostType;
  setPostType: (type: PostType) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  previewUrls: string[];
  setPreviewUrls: (urls: string[]) => void;
  isDraft: boolean;
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  isRecurring: boolean;
  setIsRecurring: (isRecurring: boolean) => void;
  frequency: string;
  setFrequency: (frequency: string) => void;
  intervalValue: number;
  setIntervalValue: (value: number) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  customIntervalHours: number;
  setCustomIntervalHours: (hours: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  clearDraft: () => void;
  pollOptions: PollOption[];
  setPollOptions: (options: PollOption[]) => void;
}

export const CreatePostFormContent = ({
  accounts,
  content,
  setContent,
  selectedAccount,
  setSelectedAccount,
  date,
  setDate,
  postType,
  setPostType,
  uploadedFiles,
  setUploadedFiles,
  previewUrls,
  setPreviewUrls,
  isDraft,
  hashtags,
  setHashtags,
  isRecurring,
  setIsRecurring,
  frequency,
  setFrequency,
  intervalValue,
  setIntervalValue,
  endDate,
  setEndDate,
  customIntervalHours,
  setCustomIntervalHours,
  onSubmit,
  clearDraft,
  pollOptions,
  setPollOptions
}: CreatePostFormContentProps) => {
  const handleFileUpload = (files: File[]) => {
    if (postType === 'carousel') {
      setUploadedFiles((prev: File[]) => [...prev, ...files]);
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev: string[]) => [...prev, ...newPreviewUrls]);
    } else {
      setUploadedFiles([files[0]]);
      const objectUrl = URL.createObjectURL(files[0]);
      setPreviewUrls([objectUrl]);
    }
  };

  const handleFileDelete = (index: number) => {
    setUploadedFiles((prev: File[]) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev: string[]) => prev.filter((_, i) => i !== index));
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
        pollOptions={pollOptions}
        onPollOptionsChange={setPollOptions}
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
        onSubmit={onSubmit}
        isRecurring={isRecurring}
        isDraft={isDraft}
        onClearDraft={clearDraft}
      />
    </div>
  );
};