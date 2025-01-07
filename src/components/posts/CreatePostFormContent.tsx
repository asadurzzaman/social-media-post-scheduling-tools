import { PostTypeSelect, PostType } from './PostTypeSelect';
import { SocialAccountList } from './SocialAccountList';
import { RichTextEditor } from './RichTextEditor';
import { SchedulingOptions } from './SchedulingOptions';
import { PostFormActions } from './PostFormActions';

interface CreatePostFormContentProps {
  accounts: any[];
  content: string;
  setContent: (content: string) => void;
  selectedAccounts: string[];
  setSelectedAccounts: (accounts: string[]) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  postType: PostType;
  setPostType: (type: PostType) => void;
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
  selectedAccounts,
  setSelectedAccounts,
  date,
  setDate,
  postType,
  setPostType,
  isDraft,
  onSubmit,
  clearDraft,
  timezone,
  onTimezoneChange,
  onPublishNow,
  onSaveDraft,
  initialPost
}: CreatePostFormContentProps) => {
  return (
    <div className="space-y-6 max-w-2xl">
      <SocialAccountList
        accounts={accounts}
        selectedAccounts={selectedAccounts}
        onSelect={setSelectedAccounts}
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
        />
      </div>

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
    </div>
  );
};