import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

type SyncFn = () => Promise<any>;

export function useAutoSync(userId: string | undefined, sync: SyncFn) {
  // Guardamos la función en un ref para que los listeners siempre usen
  // la versión más reciente sin re-suscribirse en cada render.
  const syncRef = useRef(sync);
  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  // Evita disparar dos syncs solapados
  const enCurso = useRef(false);

  async function dispararSync(motivo: string) {
    if (!userId || enCurso.current) return;
    enCurso.current = true;
    try {
      if (__DEV__) console.log(`[autosync] disparado por: ${motivo}`);
      await syncRef.current();
    } finally {
      enCurso.current = false;
    }
  }

  // 1) Sync cuando la app vuelve a primer plano
  useEffect(() => {
    if (!userId) return;

    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        dispararSync('app en primer plano');
      }
    });

    return () => sub.remove();
  }, [userId]);

  // 2) Sync cuando se recupera la conexión
  useEffect(() => {
    if (!userId || Platform.OS === 'web') return;

    let estabaConectado = true;

    const unsub = NetInfo.addEventListener((estado) => {
      const conectadoAhora = !!estado.isConnected;
      // Solo dispara en la transición de "sin red" a "con red"
      if (conectadoAhora && !estabaConectado) {
        dispararSync('conexión recuperada');
      }
      estabaConectado = conectadoAhora;
    });

    return () => unsub();
  }, [userId]);
}