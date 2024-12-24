import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditPostFormProps {
  post: any;
  onSuccess: () => void;
}

export const EditPostForm = ({ post, onSuccess }: EditPostFormProps) => {
  const [content, setContent] = useState(post.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', post.id);

      if (error) throw error;

      toast.success("Post updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post content..."
        className="min-h-[150px]"
      />
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Post"}
        </Button>
      </div>
    </form>
  );
};