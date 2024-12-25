import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { date: "Jan", value: 0.4 },
  { date: "Feb", value: 0.3 },
  { date: "Mar", value: 0.5 },
  { date: "Apr", value: 0.3 },
  { date: "May", value: 0.4 },
  { date: "Jun", value: 0.35 },
  { date: "Jul", value: 0.45 },
  { date: "Aug", value: 0.3 },
  { date: "Sep", value: 0.45 },
  { date: "Oct", value: 0.35 },
  { date: "Nov", value: 0.4 },
  { date: "Dec", value: 0.5 },
];

export function ActivityChart() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Created</span>
          <div className="flex items-center gap-4">
            <span className="text-sm font-normal text-muted-foreground">Daily</span>
            <span className="text-sm font-normal text-muted-foreground">Weekly</span>
            <span className="text-sm font-normal text-muted-foreground">Monthly</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}