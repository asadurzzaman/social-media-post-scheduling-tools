import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "../posts/MediaUpload";
import { PostType } from "../posts/PostTypeSelect";
import { SchedulingOptions } from "../posts/SchedulingOptions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateFacebookPostProps {
  pageId: string;
  onSuccess?: () => void;
}

export const CreateFacebookPost = ({ pageId, onSuccess }: CreateFacebookPostProps) => {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [timezone, setTimezone] = useState("UTC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let mediaUrls: string[] = [];
      
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(fileName);

          mediaUrls.push(publicUrl);
        }
      }

      const { error } = await supabase
        .from('facebook_posts')
        .insert({
          user_id: user.id,
          page_id: pageId,
          content,
          media_urls: mediaUrls,
          scheduled_time: scheduledDate?.toISOString(),
          status: scheduledDate ? 'scheduled' : 'pending'
        });

      if (error) throw error;

      toast.success(scheduledDate ? "Post scheduled successfully" : "Post created successfully");
      onSuccess?.();
      
      // Reset form
      setContent("");
      setPostType("text");
      setUploadedFiles([]);
      setPreviewUrls([]);
      setScheduledDate(undefined);
      
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Post Content <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          required
          className="min-h-[100px]"
        />
      </div>

      <MediaUpload
        postType={postType}
        uploadedFiles={uploadedFiles}
        previewUrls={previewUrls}
        onFileUpload={(files) => {
          setUploadedFiles([files[0]]);
          const objectUrl = URL.createObjectURL(files[0]);
          setPreviewUrls([objectUrl]);
        }}
        onFileDelete={(index) => {
          setUploadedFiles([]);
          setPreviewUrls([]);
        }}
      />

      <SchedulingOptions
        date={scheduledDate}
        onDateChange={setScheduledDate}
        onTimezoneChange={setTimezone}
      />

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || !content}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {scheduledDate ? "Scheduling..." : "Publishing..."}
            </>
          ) : (
            scheduledDate ? "Schedule Post" : "Publish Now"
          )}
        </Button>
      </div>
    </form>
  );
};