import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { FileText, Image, Film, Calendar, Save, Eye, Clock, Settings } from "lucide-react";
import { PostType } from "./PostTypeSelect";

interface CreatePostSidebarProps {
  postType: PostType;
  onPostTypeChange: (type: PostType) => void;
  onPreviewClick: () => void;
  onSaveDraft: () => void;
}

export const CreatePostSidebar = ({
  postType,
  onPostTypeChange,
  onPreviewClick,
  onSaveDraft
}: CreatePostSidebarProps) => {
  return (
    <Sidebar className="w-64 border-r">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Post Type
            </h3>
            <SidebarGroupContent>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onPostTypeChange("text")}
                  className={`w-full ${postType === "text" ? "bg-accent" : ""}`}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Text Post</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onPostTypeChange("image")}
                  className={`w-full ${postType === "image" ? "bg-accent" : ""}`}
                >
                  <Image className="mr-2 h-4 w-4" />
                  <span>Photo Post</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onPostTypeChange("video")}
                  className={`w-full ${postType === "video" ? "bg-accent" : ""}`}
                >
                  <Film className="mr-2 h-4 w-4" />
                  <span>Video Post</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Actions
            </h3>
            <SidebarGroupContent>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onPreviewClick}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Preview Post</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save Draft</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Tools
            </h3>
            <SidebarGroupContent>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Schedule</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Best Time</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};