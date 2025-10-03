import { useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function useRealtimeBusinessConfig(onConfigUpdate: () => void) {
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const channel = supabase
      .channel('business-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_config',
        },
        (payload) => {
          console.log('Realtime: business_config changed', payload);
          onConfigUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, onConfigUpdate]);
}
