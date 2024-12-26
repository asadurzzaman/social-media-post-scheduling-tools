import { PostType } from '../PostTypeSelect';

export interface PollOption {
  id: string;
  text: string;
}

export interface PostFormState {
  content: string;
  selectedAccount: string;
  date: Date | undefined;
  timezone: string;
  postType: PostType;
  uploadedFiles: File[];
  previewUrls: string[];
  isDraft: boolean;
  pollOptions: PollOption[];
}

export interface PostFormHandlers {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handlePublishNow: () => Promise<void>;
  handleSaveDraft: () => void;
  clearDraft: () => void;
}