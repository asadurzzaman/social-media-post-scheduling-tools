export interface Post {
  id: string;
  content: string;
  status: string;
  created_at: string;
  scheduled_for: string;
  hashtags: string[];
  image_url: string | null;
  poll_options: string[];
  social_account_id: string;
  timezone: string;
  user_id: string;
  group_id: string | null;
  post_type: string;
  search_vector: unknown;
  social_accounts: {
    platform: string;
  };
}