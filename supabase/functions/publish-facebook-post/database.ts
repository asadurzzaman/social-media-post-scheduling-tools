import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export class Database {
  private static client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  static async getPostDetails(postId: string) {
    const { data, error } = await this.client
      .from('posts')
      .select(`
        content,
        image_url,
        poll_options,
        social_accounts!inner(
          page_id,
          page_access_token,
          token_expires_at,
          user_id
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Failed to fetch post:', error);
      throw new Error('Failed to fetch post details');
    }

    return data;
  }

  static async markAccountForReconnection(userId: string, pageId: string, error: string) {
    const { error: updateError } = await this.client
      .from('social_accounts')
      .update({ 
        requires_reconnect: true,
        last_error: error
      })
      .eq('user_id', userId)
      .eq('page_id', pageId);

    if (updateError) {
      console.error('Failed to mark account for reconnection:', updateError);
    }
  }

  static async updatePostStatus(postId: string, status: string) {
    const { error } = await this.client
      .from('posts')
      .update({ status })
      .eq('id', postId);

    if (error) {
      console.error('Failed to update post status:', error);
      throw new Error('Failed to update post status');
    }
  }
}