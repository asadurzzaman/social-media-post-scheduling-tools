import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SchedulingOptionsProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export const SchedulingOptions = ({
  date,
  onDateChange,
}: SchedulingOptionsProps) => {
  const handleTimeChange = (timeString: string) => {
    if (!date) return;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    onDateChange(newDate);
  };

  // Generate time options in 30-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          Schedule Date & Time <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mt-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateChange}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={date ? format(date, "HH:mm") : undefined}
            onValueChange={handleTimeChange}
            disabled={!date}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select time">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {date ? format(date, "HH:mm") : "Select time"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {generateTimeOptions().map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};