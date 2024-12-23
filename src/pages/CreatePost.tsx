import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PostTypeSelect, PostType } from "@/components/posts/PostTypeSelect";
import { MediaUpload } from "@/components/posts/MediaUpload";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [date, setDate] = useState<Date>();
  const [postType, setPostType] = useState<PostType>("image");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Get current user's ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch user's Facebook accounts
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("platform", "facebook");
      
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = (file: File) => {
    if (postType === 'carousel') {
      setUploadedFiles(prev => [...prev, file]);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, objectUrl]);
    } else {
      setUploadedFiles([file]);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrls([objectUrl]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !selectedAccount || !date || !userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (postType !== 'text-only' && uploadedFiles.length === 0) {
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
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        status: "scheduled",
        user_id: userId
      });

      if (error) throw error;

      toast.success("Post scheduled successfully!");
      setContent("");
      setSelectedAccount("");
      setDate(undefined);
      setUploadedFiles([]);
      setPreviewUrls([]);
      setPostType("image");
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Post</h2>
          <p className="text-muted-foreground">Schedule a new social media post</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <label htmlFor="account" className="text-sm font-medium">
              Facebook Account <span className="text-red-500">*</span>
            </label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PostTypeSelect 
            value={postType} 
            onChange={setPostType} 
          />

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Post Content <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="min-h-[150px]"
            />
          </div>

          <MediaUpload
            postType={postType}
            uploadedFile={uploadedFiles[0] || null}
            previewUrl={previewUrls[0] || null}
            onFileUpload={handleFileUpload}
          />

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

          <Button type="submit" className="w-full">
            Schedule Post
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;
