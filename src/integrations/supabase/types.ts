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
      }
      posts: {
        Row: {
          content: string
          created_at: string
          group_id?: string | null  // Made optional
          hashtags: string[] | null
          id: string
          image_url: string | null
          poll_options: string[] | null
          scheduled_for: string
          social_account_id: string
          status: string | null
          timezone: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: string | null  // Made optional
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          poll_options?: string[] | null
          scheduled_for: string
          social_account_id: string
          status?: string | null
          timezone?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string | null  // Made optional
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          poll_options?: string[] | null
          scheduled_for?: string
          social_account_id?: string
          status?: string | null
          timezone?: string | null
          user_id?: string
        }
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          timezone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          timezone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
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
          social_account_id?: string
          start_date?: string
          status?: string | null
          user_id?: string
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
      social_accounts: {
        Row: {
          access_token: string | null
          account_name: string
          created_at: string
          id: string
          page_access_token: string | null
          page_id: string | null
          platform: string
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_name: string
          created_at?: string
          id: string
          page_access_token?: string | null
          page_id?: string | null
          platform: string
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_name?: string
          created_at?: string
          id: string
          page_access_token?: string | null
          page_id?: string | null
          platform?: string
          token_expires_at?: string | null
          user_id?: string
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
