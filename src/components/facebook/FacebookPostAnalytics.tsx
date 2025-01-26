import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PostTimeAnalytics {
  id: string;
  user_id: string;
  social_account_id: string;
  day_of_week: number;
  hour_of_day: number;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

interface FacebookPostAnalyticsProps {
  postId: string;
}

export const FacebookPostAnalytics = ({ postId }: FacebookPostAnalyticsProps) => {
  const { data: analytics, isLoading } = useQuery<PostTimeAnalytics | null>({
    queryKey: ['post-analytics', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_time_analytics')
        .select('*')
        .eq('social_account_id', postId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  const chartData = [
    { name: 'Engagement', value: analytics.engagement_score },
    // Add more metrics as needed
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Post Performance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};