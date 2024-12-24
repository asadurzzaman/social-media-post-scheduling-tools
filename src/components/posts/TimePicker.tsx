import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface TimePickerProps {
  date: Date | undefined;
  onTimeChange: (timeString: string) => void;
}

export const TimePicker = ({ date, onTimeChange }: TimePickerProps) => {
  // Generate time options in 30-minute intervals with AM/PM format
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        options.push(timeString);
      }
    }
    return options;
  };

  return (
    <Select
      value={date ? format(date, "h:mm a").toUpperCase() : undefined}
      onValueChange={onTimeChange}
      disabled={!date}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Select time">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            {date ? format(date, "h:mm a").toUpperCase() : "Select time"}
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
  );
};