import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/posts/DatePicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PostFiltersProps {
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

export const PostFilters = ({
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
}: PostFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onShowUpcoming}
        className="gap-2"
      >
        <Clock className="h-4 w-4" />
        Upcoming Posts
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Start Date</div>
              <DatePicker date={startDate} onDateChange={onStartDateChange} />
            </div>
            <div>
              <div className="text-sm font-medium mb-2">End Date</div>
              <DatePicker date={endDate} onDateChange={onEndDateChange} />
            </div>
            <Button 
              className="w-full mt-2" 
              onClick={onApplyDateFilter}
              disabled={!startDate && !endDate}
            >
              Apply Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Posts</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="scheduled">Schedule Date</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
};