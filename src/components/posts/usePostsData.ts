import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, isWithinInterval } from "date-fns";

export const usePostsData = (
  statusFilter: string,
  sortBy: string,
  shouldApplyFilter: boolean,
  startDate?: Date,
  endDate?: Date
) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  return useQuery({
    queryKey: ['posts', statusFilter, sortBy, shouldApplyFilter],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*, social_accounts(platform)');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'scheduled':
          query = query.order('scheduled_for', { ascending: true });
          break;
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      let allPosts = data || [];
      
      if (shouldApplyFilter && (startDate || endDate)) {
        allPosts = allPosts.filter(post => {
          const postDate = new Date(post.scheduled_for);
          
          if (startDate && endDate) {
            return isWithinInterval(postDate, {
              start: startOfDay(startDate),
              end: endOfDay(endDate)
            });
          } else if (startDate) {
            return postDate >= startOfDay(startDate);
          } else if (endDate) {
            return postDate <= endOfDay(endDate);
          }
          return true;
        });
      }

      if (statusFilter === 'all' || statusFilter === 'draft') {
        const draftJson = localStorage.getItem('postDraft');
        if (draftJson) {
          const draft = JSON.parse(draftJson);
          allPosts = [{
            id: 'draft-' + Date.now(),
            content: draft.content || '',
            status: 'draft',
            created_at: new Date().toISOString(),
            scheduled_for: draft.date || new Date().toISOString(),
            hashtags: [],
            image_url: null,
            poll_options: draft.pollOptions || [],
            social_account_id: draft.selectedAccount || '',
            timezone: draft.timezone || 'UTC',
            user_id: '',
            group_id: null,
            post_type: draft.postType || 'text',
            social_accounts: { platform: 'draft' }
          }, ...allPosts];
        }
      }
      
      return allPosts;
    }
  });
};