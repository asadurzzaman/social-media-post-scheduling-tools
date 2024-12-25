import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Compose", path: "/create-post" },
  { label: "Publish", path: "/posts" },
  { label: "Analyze", path: "/analytics" },
  { label: "Engage", path: "/engage" },
];

export function TopNav() {
  const location = useLocation();

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <nav className="flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname.includes(item.path.toLowerCase())
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="default" className="hidden md:flex">
            Start a 14-day free trial
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>
      </div>
    </div>
  );
}