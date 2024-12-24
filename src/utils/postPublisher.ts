import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostType } from "@/components/posts/PostTypeSelect";

interface PollOption {
  id: string;
  text: string;
}

interface PublishPostParams {
  content: string;
  selectedAccount: string;
  userId: string;
  postType: PostType;
  uploadedFiles: File[];
  pollOptions: PollOption[];
  timezone: string;
  scheduledFor?: Date;
}

export const publishPost = async ({
  content,
  selectedAccount,
  userId,
  postType,
  uploadedFiles,
  pollOptions,
  timezone,
  scheduledFor,
}: PublishPostParams) => {
  if (!content || !selectedAccount || !userId) {
    throw new Error("Please fill in all required fields");
  }

  if (["image", "carousel", "video"].includes(postType) && uploadedFiles.length === 0) {
    throw new Error(`Please upload ${postType === 'carousel' ? 'at least one image' : `1 ${postType}`}`);
  }

  if (postType === 'poll' && !pollOptions.every(opt => opt.text.trim())) {
    throw new Error("Please fill in all poll options");
  }

  let imageUrls: string[] = [];
  
  if (uploadedFiles.length > 0) {
    for (const file of uploadedFiles) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }
  }

  // Insert the post
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      content,
      social_account_id: selectedAccount,
      image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
      user_id: userId,
      scheduled_for: scheduledFor ? scheduledFor.toISOString() : new Date().toISOString(),
      status: scheduledFor ? "scheduled" : "pending",
      timezone,
      poll_options: postType === 'poll' ? pollOptions.map(opt => opt.text) : null
    })
    .select()
    .single();

  if (error) throw error;

  // If it's an immediate publish, trigger the edge function
  if (!scheduledFor) {
    const { error: publishError } = await supabase.functions.invoke(
      'publish-facebook-post',
      {
        body: { postId: post.id }
      }
    );
    
    if (publishError) throw publishError;
  }
};