import { useCallback, useEffect, useState } from 'react';
import * as local from '../lib/localRepo';
import { sincronizar } from '../lib/sync';

export function useSync(userId: string | undefined) {
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimoError, setUltimoError] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState(0);
  const [fallidas, setFallidas] = useState(0);

  const actualizarPendientes = useCallback(async () => {
    try {
      setPendientes(await local.contarPendientes());
    } catch {
      setPendientes(0);
    }
  }, []);

  useEffect(() => {
    actualizarPendientes();
  }, [actualizarPendientes]);

  const sync = useCallback(async () => {
    if (!userId) return;
    setSincronizando(true);
    setUltimoError(null);
    const res = await sincronizar(userId);
    if (!res.ok) setUltimoError(res.error ?? 'Error');
    setFallidas(res?.fallidas ?? 0);
    setSincronizando(false);
    await actualizarPendientes();
    return res;
  }, [userId, actualizarPendientes]);

  return {
    sync,
    sincronizando,
    ultimoError,
    pendientes,
    fallidas,
    actualizarPendientes,
  };
}