import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePostRealtime = (onPostUpdate: () => void) => {
  useEffect(() => {
    const channel = supabase
      .channel('post-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          onPostUpdate();
          
          const eventMessages = {
            INSERT: 'New post created',
            UPDATE: 'Post updated',
            DELETE: 'Post deleted'
          };
          
          toast.info(eventMessages[payload.eventType as keyof typeof eventMessages]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onPostUpdate]);
};