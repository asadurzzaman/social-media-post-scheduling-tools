import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimezonePickerProps {
  value: string;
  onChange: (timezone: string) => void;
}

export const TimezonePicker = ({ value, onChange }: TimezonePickerProps) => {
  // Comprehensive list of major timezones grouped by region
  const timezones = {
    'Americas': [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'America/Vancouver',
      'America/Mexico_City',
      'America/Bogota',
      'America/Sao_Paulo',
      'America/Buenos_Aires'
    ],
    'Europe': [
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Madrid',
      'Europe/Rome',
      'Europe/Amsterdam',
      'Europe/Moscow',
      'Europe/Istanbul'
    ],
    'Asia': [
      'Asia/Dubai',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Asia/Singapore',
      'Asia/Hong_Kong',
      'Asia/Seoul',
      'Asia/Kolkata',
      'Asia/Bangkok',
      'Asia/Jakarta',
      'Asia/Dhaka',
      'Asia/Almaty',
      'Asia/Tashkent'
    ],
    'Pacific': [
      'Pacific/Auckland',
      'Pacific/Fiji',
      'Pacific/Honolulu',
      'Pacific/Guam'
    ],
    'Australia': [
      'Australia/Sydney',
      'Australia/Melbourne',
      'Australia/Perth',
      'Australia/Brisbane',
      'Australia/Adelaide'
    ],
    'Africa': [
      'Africa/Cairo',
      'Africa/Lagos',
      'Africa/Johannesburg',
      'Africa/Nairobi',
      'Africa/Casablanca'
    ]
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Timezone</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full mt-1.5">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {Object.entries(timezones).map(([region, zoneList]) => (
            <div key={region}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                {region}
              </div>
              {zoneList.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground mt-1">
        Times are shown in {value}
      </p>
    </div>
  );
};