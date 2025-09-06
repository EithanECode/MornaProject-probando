// Componente de prueba para verificar realtime
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function RealtimeTest() {
  const [messages, setMessages] = useState<string[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const channel = supabase
      .channel('test-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        setMessages(prev => [...prev, `Order changed: ${JSON.stringify(payload)}`]);
      })
      .subscribe((status) => {
        setMessages(prev => [...prev, `Subscription status: ${status}`]);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold">Realtime Test</h3>
      <div className="max-h-40 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">{msg}</div>
        ))}
      </div>
    </div>
  );
}
