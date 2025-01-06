import { useState } from "react";
import { PostTypeSelect, PostType } from './PostTypeSelect';
import { SocialAccountList } from './SocialAccountList';
import { RichTextEditor } from './RichTextEditor';
import { SchedulingOptions } from './SchedulingOptions';
import { PostFormMedia } from './PostFormMedia';
import { PostFormActions } from './PostFormActions';
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onSubmit: (e: React.FormEvent) => void;
  clearDraft: () => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  onPublishNow?: () => void;
  onSaveDraft?: () => void;
  initialPost?: any;
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
  onSubmit,
  clearDraft,
  timezone,
  onTimezoneChange,
  onPublishNow,
  onSaveDraft,
  initialPost
}: CreatePostFormContentProps) => {
  const handleFileUpload = (files: File[]) => {
    if (postType === 'carousel') {
      const newFiles = [...uploadedFiles, ...files];
      setUploadedFiles(newFiles);
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    } else {
      setUploadedFiles([files[0]]);
      const objectUrl = URL.createObjectURL(files[0]);
      setPreviewUrls([objectUrl]);
    }
  };

  const handleFileDelete = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  return (
    <Card className="p-6 space-y-6 max-w-3xl mx-auto bg-white shadow-lg">
      <SocialAccountList
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelect={setSelectedAccount}
      />

      <PostTypeSelect 
        value={postType} 
        onChange={setPostType} 
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="content" className="text-sm font-medium">
            Post Content <span className="text-red-500">*</span>
          </label>
          <Button variant="ghost" size="sm" className="text-primary">
            <Wand2 className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
        </div>
        <RichTextEditor
          value={content}
          onChange={setContent}
          maxLength={2200}
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
        onTimezoneChange={onTimezoneChange}
      />

      <PostFormActions
        onSubmit={onSubmit}
        isDraft={isDraft}
        onClearDraft={clearDraft}
        onPublishNow={onPublishNow}
        onSaveDraft={onSaveDraft}
        isEditing={!!initialPost}
      />
    </Card>
  );
};