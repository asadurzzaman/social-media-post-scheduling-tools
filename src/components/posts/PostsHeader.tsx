import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { PostFilters } from "./PostFilters";

interface PostsHeaderProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: any) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onShowUpcoming: () => void;
  onApplyDateFilter: () => void;
}

export const PostsHeader = ({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onRefresh,
  isRefreshing,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onShowUpcoming,
  onApplyDateFilter,
}: PostsHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Posts</h2>
          <p className="text-muted-foreground">
            View and manage all your social media posts
          </p>
        </div>
        <Button asChild>
          <Link to="/create-post" className="gap-2">
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>
      
      <PostFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onShowUpcoming={onShowUpcoming}
        onApplyDateFilter={onApplyDateFilter}
      />
    </div>
  );
};