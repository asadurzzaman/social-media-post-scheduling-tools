import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Filter } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onRefresh: () => void;
  view: 'week' | 'month';
  onViewChange: (view: string) => void;
}

export const CalendarHeader = ({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onRefresh,
  view,
  onViewChange,
}: CalendarHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">View and manage your content schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/create-post" className="gap-2">
              <Plus className="h-4 w-4" />
              New post
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onPreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={onToday}
            >
              Today
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Select value={view} onValueChange={onViewChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};