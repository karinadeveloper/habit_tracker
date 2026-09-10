import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { CheckIn } from '../lib/database.types';
import { LOCAL_DB_DISPONIBLE } from '../lib/db';
import * as local from '../lib/localRepo';
import { supabase } from '../lib/supabase';
import { ahoraUTC } from '../lib/time';

export function useCheckIns(userId: string | undefined, year: number, month: number) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const ultimoDia = new Date(year, month, 0).getDate();
  const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

  async function fetchCheckIns() {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    if (LOCAL_DB_DISPONIBLE) {
      // 1) Baja de la nube las filas de ESTE mes a SQLite (si hay internet)
      try {
        const { data } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', userId)
          .gte('day', firstDay)
          .lte('day', lastDay);

        if (data) {
          for (const remoto of data) {
            await local.fusionarDesdeNube(remoto);
          }
        }
      } catch {
        // sin internet: seguimos con lo que haya en local
      }

      // 2) Lee de SQLite (ya actualizado)
      setCheckIns(await local.listarCheckIns(userId, firstDay, lastDay));
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .gte('day', firstDay)
      .lte('day', lastDay)
      .is('deleted_at', null);

    setCheckIns(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCheckIns();
  }, [userId, year, month]);

  async function toggleCheckIn(itemId: string, day: string) {
    if (!userId) return;

    // 1) Calcula el nuevo estado y actualiza la UI INMEDIATAMENTE (optimista)
    const existente = checkIns.find((c) => c.item_id === itemId && c.day === day);
    const nuevoDone = existente ? !existente.done : true;
    const USAR_LOCAL = Platform.OS !== 'web';

    setCheckIns((prev) => {
      if (existente) {
        return prev.map((c) =>
          c.id === existente.id ? { ...c, done: nuevoDone } : c
        );
      }
      // Optimista: creamos una fila temporal para que se vea ya
      const temporal: CheckIn = {
        id: `temp-${itemId}-${day}`,
        user_id: userId,
        item_id: itemId,
        day,
        done: true,
        value: null,
        note: null,
        created_at: ahoraUTC(),
        updated_at: ahoraUTC(),
        deleted_at: null,
      };
      return [...prev, temporal];
    });

    // 2) Persiste en segundo plano (sin bloquear la UI)
    try {
      if (USAR_LOCAL) {
        const real = await local.alternarCheckIn(userId, itemId, day);
        // Reemplaza la fila temporal/vieja por la real (con su id definitivo)
        setCheckIns((prev) => {
          const sinTemp = prev.filter(
            (c) => c.id !== `temp-${itemId}-${day}` && !(c.item_id === itemId && c.day === day && c.id !== real.id)
          );
          const yaEsta = sinTemp.some((c) => c.id === real.id);
          return yaEsta
            ? sinTemp.map((c) => (c.id === real.id ? real : c))
            : [...sinTemp, real];
        });
      } else {
        if (existente) {
          await supabase
            .from('check_ins')
            .update({ done: nuevoDone, updated_at: ahoraUTC() })
            .eq('id', existente.id);
        } else {
          const { data } = await supabase
            .from('check_ins')
            .insert({ user_id: userId, item_id: itemId, day, done: true })
            .select()
            .single();
          if (data) {
            // reemplaza la fila temporal por la real de la BD
            setCheckIns((prev) => {
              const sinTemp = prev.filter((c) => c.id !== `temp-${itemId}-${day}`);
              return [...sinTemp, data as CheckIn];
            });
          }
        }
      }
    } catch (e) {
      // 3) Si falla, revierte el cambio optimista
      setCheckIns((prev) =>
        existente
          ? prev.map((c) => (c.id === existente.id ? { ...c, done: !nuevoDone } : c))
          : prev.filter((c) => c.id !== `temp-${itemId}-${day}`)
      );
    }
  }

  function isChecked(itemId: string, day: string) {
    return checkIns.some((c) => c.item_id === itemId && c.day === day && c.done);
  }

  function aplicarCambioRemoto(payload: any) {
    const fila = payload.new;
    if (!fila || !fila.id) return;

    setCheckIns((prev) => {
      // ¿ya existe esa fila en el estado?
      const existe = prev.some((c) => c.id === fila.id);

      // Normaliza el booleano (Supabase manda true/false, tu tipo espera boolean)
      const nueva = { ...fila, done: !!fila.done } as CheckIn;

      // Si está borrada o fuera del mes visible, quítala
      if (fila.deleted_at) {
        return prev.filter((c) => c.id !== fila.id);
      }
      // Ignora cambios de otros meses (no están en esta vista)
      if (fila.day < firstDay || fila.day > lastDay) {
        return existe ? prev.filter((c) => c.id !== fila.id) : prev;
      }

      return existe
        ? prev.map((c) => (c.id === fila.id ? nueva : c))
        : [...prev, nueva];
    });
  }

  return { checkIns, loading, toggleCheckIn, isChecked, refetch: fetchCheckIns, aplicarCambioRemoto };
}