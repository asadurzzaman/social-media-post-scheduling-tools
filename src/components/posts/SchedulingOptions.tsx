import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Repeat } from "lucide-react";
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

interface SchedulingOptionsProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  isRecurring: boolean;
  onRecurringChange: (isRecurring: boolean) => void;
  frequency: string;
  onFrequencyChange: (frequency: string) => void;
  intervalValue: number;
  onIntervalValueChange: (value: number) => void;
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
  customIntervalHours?: number;
  onCustomIntervalChange?: (hours: number) => void;
}

export const SchedulingOptions = ({
  date,
  onDateChange,
  isRecurring,
  onRecurringChange,
  frequency,
  onFrequencyChange,
  intervalValue,
  onIntervalValueChange,
  endDate,
  onEndDateChange,
  customIntervalHours,
  onCustomIntervalChange,
}: SchedulingOptionsProps) => {
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
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
                onSelect={onDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          type="button"
          variant={showRecurringOptions ? "default" : "outline"}
          onClick={() => {
            setShowRecurringOptions(!showRecurringOptions);
            onRecurringChange(!showRecurringOptions);
          }}
          className="gap-2"
        >
          <Repeat className="h-4 w-4" />
          Recurring
        </Button>
      </div>

      {showRecurringOptions && (
        <div className="space-y-4 border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Select value={frequency} onValueChange={onFrequencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === "custom" ? (
              <div>
                <label className="text-sm font-medium">Hours Interval</label>
                <input
                  type="number"
                  min="1"
                  value={customIntervalHours}
                  onChange={(e) => onCustomIntervalChange?.(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Every</label>
                <input
                  type="number"
                  min="1"
                  value={intervalValue}
                  onChange={(e) => onIntervalValueChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
};