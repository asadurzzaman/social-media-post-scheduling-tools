export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          content: string
          created_at: string
          group_id: string | null
          id: string
          image_urls: string[] | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: string | null
          id?: string
          image_urls?: string[] | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          image_urls?: string[] | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "idea_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          folder_path: string | null
          id: string
          metadata: Json | null
          mime_type: string
          search_vector: unknown | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          folder_path?: string | null
          id?: string
          metadata?: Json | null
          mime_type: string
          search_vector?: unknown | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          folder_path?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string
          search_vector?: unknown | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_time_analytics: {
        Row: {
          created_at: string
          day_of_week: number
          engagement_score: number
          hour_of_day: number
          id: string
          social_account_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          engagement_score: number
          hour_of_day: number
          id?: string
          social_account_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          engagement_score?: number
          hour_of_day?: number
          id?: string
          social_account_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_time_analytics_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_time_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          group_id: string | null
          hashtags: string[] | null
          id: string
          scheduled_for: string
          search_vector: unknown | null
          social_account_id: string
          status: string | null
          timezone: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: string | null
          hashtags?: string[] | null
          id?: string
          scheduled_for: string
          search_vector?: unknown | null
          social_account_id: string
          status?: string | null
          timezone?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string | null
          hashtags?: string[] | null
          id?: string
          scheduled_for?: string
          search_vector?: unknown | null
          social_account_id?: string
          status?: string | null
          timezone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "idea_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          login_count: number | null
          post_platform_selection: boolean | null
          timezone: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          login_count?: number | null
          post_platform_selection?: boolean | null
          timezone?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          login_count?: number | null
          post_platform_selection?: boolean | null
          timezone?: string | null
        }
        Relationships: []
      }
      recurring_posts: {
        Row: {
          content: string
          created_at: string
          custom_interval_hours: number | null
          end_date: string | null
          frequency: string
          hashtags: string[] | null
          id: string
          image_url: string | null
          interval_value: number
          last_posted_at: string | null
          poll_options: string[] | null
          social_account_id: string
          start_date: string
          status: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          custom_interval_hours?: number | null
          end_date?: string | null
          frequency: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          interval_value?: number
          last_posted_at?: string | null
          poll_options?: string[] | null
          social_account_id: string
          start_date: string
          status?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          custom_interval_hours?: number | null
          end_date?: string | null
          frequency?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          interval_value?: number
          last_posted_at?: string | null
          poll_options?: string[] | null
          social_account_id: string
          start_date: string
          status?: string | null
          user_id: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_logs: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          query: string
          result_count: number | null
          search_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          query: string
          result_count?: number | null
          search_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string
          result_count?: number | null
          search_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string | null
          account_name: string
          avatar_url: string | null
          created_at: string
          id: string
          instagram_user_id: string | null
          instagram_username: string | null
          last_error: string | null
          linkedin_profile_url: string | null
          linkedin_user_id: string | null
          page_access_token: string | null
          page_id: string | null
          platform: string
          requires_reconnect: boolean | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_name: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          instagram_user_id?: string | null
          instagram_username?: string | null
          last_error?: string | null
          linkedin_profile_url?: string | null
          linkedin_user_id?: string | null
          page_access_token?: string | null
          page_id?: string | null
          platform: string
          requires_reconnect?: boolean | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_name?: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          instagram_user_id?: string | null
          instagram_username?: string | null
          last_error?: string | null
          linkedin_profile_url?: string | null
          linkedin_user_id?: string | null
          page_access_token?: string | null
          page_id?: string | null
          platform?: string
          requires_reconnect?: boolean | null
          token_expires_at?: string | null
          user_id: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          price_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          price_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          price_id?: string
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export interface Post {
  id: string;
  user_id: string;
  social_account_id: string;
  content: string;
  hashtags?: string[];
  scheduled_for: string;
  status?: string;
  created_at: string;
  timezone?: string;
  group_id?: string;
  search_vector?: unknown;
  social_accounts: {
    platform: string;
  };
}
