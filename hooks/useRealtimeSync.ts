import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

type CambioHandler = (tabla: 'items' | 'check_ins', payload: any) => void;

export function useRealtimeSync(userId: string | undefined, onCambio: CambioHandler) {
  const cbRef = useRef(onCambio);
  useEffect(() => {
    cbRef.current = onCambio;
  }, [onCambio]);

  useEffect(() => {
    if (!userId) return;

    const canal = supabase
      .channel(`cambios-usuario-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${userId}` },
        (payload) => cbRef.current('items', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'check_ins', filter: `user_id=eq.${userId}` },
        (payload) => cbRef.current('check_ins', payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [userId]);
}