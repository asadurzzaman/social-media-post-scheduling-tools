import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PostTypeSelect, PostType } from './PostTypeSelect';
import { MediaUpload } from './MediaUpload';
import { SocialAccountList } from './SocialAccountList';
import { TinyMCEEditor } from './TinyMCEEditor';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostFormProps {
  accounts: any[];
  userId: string | null;
}

export const CreatePostForm = ({ accounts, userId }: CreatePostFormProps) => {
  const [content, setContent] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [date, setDate] = useState<Date>();
  const [postType, setPostType] = useState<PostType>("text");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState(false);

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('postDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setContent(draft.content || "");
      setPostType(draft.postType || "text");
      setSelectedAccount(draft.selectedAccount || "");
      if (draft.date) setDate(new Date(draft.date));
    }
  }, []);

  // Save draft to localStorage when content changes
  useEffect(() => {
    if (content || selectedAccount || date || postType !== "text") {
      const draft = {
        content,
        postType,
        selectedAccount,
        date: date?.toISOString(),
      };
      localStorage.setItem('postDraft', JSON.stringify(draft));
      setIsDraft(true);
    }
  }, [content, postType, selectedAccount, date]);

  const handleFileUpload = (files: File[]) => {
    if (postType === 'carousel') {
      setUploadedFiles(prev => [...prev, ...files]);
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } else {
      setUploadedFiles([files[0]]);
      const objectUrl = URL.createObjectURL(files[0]);
      setPreviewUrls([objectUrl]);
    }
  };

  const handleFileDelete = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearDraft = () => {
    localStorage.removeItem('postDraft');
    setContent("");
    setSelectedAccount("");
    setDate(undefined);
    setPostType("text");
    setUploadedFiles([]);
    setPreviewUrls([]);
    setIsDraft(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !selectedAccount || !date || !userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (["image", "carousel", "video"].includes(postType) && uploadedFiles.length === 0) {
      toast.error(`Please upload ${postType === 'carousel' ? 'at least one image' : `1 ${postType}`}`);
      return;
    }

    try {
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

      const { error } = await supabase.from("posts").insert({
        content,
        social_account_id: selectedAccount,
        scheduled_for: date.toISOString(),
        image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
        status: "scheduled",
        user_id: userId
      });

      if (error) throw error;

      toast.success("Post scheduled successfully!");
      clearDraft();
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <SocialAccountList
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelect={setSelectedAccount}
      />

      <PostTypeSelect 
        value={postType} 
        onChange={setPostType} 
      />

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Post Content <span className="text-red-500">*</span>
        </label>
        <TinyMCEEditor
          value={content}
          onChange={setContent}
          maxLength={2200}
        />
      </div>

      {["image", "carousel", "video"].includes(postType) && (
        <MediaUpload
          postType={postType}
          uploadedFiles={uploadedFiles}
          previewUrls={previewUrls}
          onFileUpload={handleFileUpload}
          onFileDelete={handleFileDelete}
        />
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Schedule Date & Time <span className="text-red-500">*</span>
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Schedule Post
        </Button>
        {isDraft && (
          <Button type="button" variant="outline" onClick={clearDraft}>
            Clear Draft
          </Button>
        )}
      </div>
    </form>
  );
};
