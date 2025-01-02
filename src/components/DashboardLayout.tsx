import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, PenSquare, Calendar, BarChart3, LogOut, User, UserPlus, FilePlus, Image, Settings, Layers, FileText, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TopNav } from "@/components/TopNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: UserPlus, label: "Add Account", path: "/add-account" },
  { icon: FilePlus, label: "Create Post", path: "/create-post" },
  { icon: Layers, label: "My Posts", path: "/posts" },
  { icon: PenSquare, label: "Compose", path: "/compose" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Image, label: "Media", path: "/media" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const legalItems = [
  { icon: FileText, label: "Privacy Policy", path: "/privacy-policy" },
  { icon: FileText, label: "Terms of Service", path: "/terms-of-service" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session || error) {
        navigate("/login");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <div className="flex items-center justify-between px-3 py-4">
                <h1 className="text-xl font-bold text-primary">SocialManager</h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="mr-2"
                  >
                    {theme === "light" ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <SidebarGroupContent className="list-none">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path} className="list-none">
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <div className="mt-4 mb-2 px-3">
                  <div className="text-xs font-medium text-muted-foreground">Legal</div>
                </div>
                {legalItems.map((item) => (
                  <SidebarMenuItem key={item.path} className="list-none">
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1">
          <TopNav />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
