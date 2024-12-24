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
  // UTC offsets with major cities
  const utcOffsets = [
    { offset: 'UTC-12:00', cities: '(Baker Island)' },
    { offset: 'UTC-11:00', cities: '(American Samoa)' },
    { offset: 'UTC-10:00', cities: '(Hawaii)' },
    { offset: 'UTC-09:00', cities: '(Alaska)' },
    { offset: 'UTC-08:00', cities: '(Los Angeles, Vancouver)' },
    { offset: 'UTC-07:00', cities: '(Denver, Phoenix)' },
    { offset: 'UTC-06:00', cities: '(Chicago, Mexico City)' },
    { offset: 'UTC-05:00', cities: '(New York, Toronto)' },
    { offset: 'UTC-04:00', cities: '(Halifax, Santiago)' },
    { offset: 'UTC-03:00', cities: '(São Paulo, Buenos Aires)' },
    { offset: 'UTC-02:00', cities: '(South Georgia)' },
    { offset: 'UTC-01:00', cities: '(Cape Verde)' },
    { offset: 'UTC+00:00', cities: '(London, Dublin)' },
    { offset: 'UTC+01:00', cities: '(Paris, Berlin, Rome)' },
    { offset: 'UTC+02:00', cities: '(Cairo, Athens)' },
    { offset: 'UTC+03:00', cities: '(Moscow, Istanbul)' },
    { offset: 'UTC+04:00', cities: '(Dubai, Baku)' },
    { offset: 'UTC+05:00', cities: '(Karachi, Tashkent)' },
    { offset: 'UTC+06:00', cities: '(Dhaka, Almaty)' },
    { offset: 'UTC+07:00', cities: '(Bangkok, Jakarta)' },
    { offset: 'UTC+08:00', cities: '(Singapore, Beijing)' },
    { offset: 'UTC+09:00', cities: '(Tokyo, Seoul)' },
    { offset: 'UTC+10:00', cities: '(Sydney, Brisbane)' },
    { offset: 'UTC+11:00', cities: '(Solomon Islands)' },
    { offset: 'UTC+12:00', cities: '(Auckland, Fiji)' },
    { offset: 'UTC+13:00', cities: '(Samoa, Tonga)' },
    { offset: 'UTC+14:00', cities: '(Line Islands)' }
  ];

  // Comprehensive list of major timezones grouped by region
  const timezones = {
    'UTC/GMT': utcOffsets.map(({ offset, cities }) => `${offset} ${cities}`),
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