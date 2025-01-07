export interface Post {
  id: string;
  content: string;
  status: string;
  created_at: string;
  scheduled_for: string;
  hashtags: string[];
  social_account_id: string;
  timezone: string;
  user_id: string;
  group_id: string | null;
  search_vector: unknown | null;
  social_accounts?: {
    platform: string;
  };
}