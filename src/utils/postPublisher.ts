import { supabase } from "@/integrations/supabase/client";
import { PostType } from "@/components/posts/PostTypeSelect";

interface PublishPostParams {
  content: string;
  selectedAccount: string;
  userId: string;
  postType: PostType;
  timezone: string;
  scheduledFor?: Date;
  postId?: string;
}

export const publishPost = async ({
  content,
  selectedAccount,
  userId,
  timezone,
  scheduledFor,
  postId,
}: PublishPostParams) => {
  if (!selectedAccount) {
    throw new Error("Please select a social media account");
  }

  if (!content) {
    throw new Error("Please add a caption for your post");
  }

  if (!userId) {
    throw new Error("You must be logged in to publish a post");
  }

  const initialStatus = scheduledFor ? 'scheduled' : 'pending';

  if (postId) {
    const { error } = await supabase
      .from("posts")
      .update({
        content,
        social_account_id: selectedAccount,
        scheduled_for: scheduledFor ? scheduledFor.toISOString() : new Date().toISOString(),
        status: initialStatus,
        timezone,
      })
      .eq('id', postId);

    if (error) throw error;
  } else {
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        content,
        social_account_id: selectedAccount,
        user_id: userId,
        scheduled_for: scheduledFor ? scheduledFor.toISOString() : new Date().toISOString(),
        status: initialStatus,
        timezone,
      })
      .select()
      .single();

    if (error) throw error;

    if (!scheduledFor) {
      const { error: publishError } = await supabase.functions.invoke(
        'publish-facebook-post',
        {
          body: { postId: post.id }
        }
      );
      
      if (publishError) throw publishError;
    }
  }
};