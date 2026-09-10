import { Platform } from 'react-native';
import { getDb } from './db';
import { supabase } from './supabase';
import { ahoraUTC } from './time';

export type SyncResult = { ok: boolean; error?: string; fallidas?: number };

const USAR_LOCAL = Platform.OS !== 'web';

export async function sincronizar(userId: string): Promise<SyncResult> {
  if (!USAR_LOCAL) return { ok: true };

  try {
    const db = await getDb();

    // ---- PUSH: subir filas sucias ----
    let fallidas = 0;

    for (const tabla of ['items', 'check_ins'] as const) {
      const sucias: any[] = await db.getAllAsync(
        `SELECT * FROM ${tabla} WHERE dirty = 1`
      );

      for (const fila of sucias) {
        try {
          const registro = prepararParaNube(tabla, fila);
          const { error } = await supabase
            .from(tabla)
            .upsert(registro, { onConflict: 'id' });

          if (error) {
            if (__DEV__) console.log(`[sync] error subiendo ${tabla} ${fila.id}:`, error.message);
            fallidas++;
          } else {
            await db.runAsync(
              `UPDATE ${tabla} SET dirty = 0 WHERE id = ?`,
              [fila.id]
            );
          }
        } catch (e: any) {
          if (__DEV__) console.log(`[sync] excepción subiendo ${tabla} ${fila.id}:`, e.message);
          fallidas++;
        }
      }
    }

    // ---- PULL: bajar cambios de la nube ----
    const ultimaSync = await leerMeta('ultima_sync');

    for (const tabla of ['items', 'check_ins'] as const) {
      let query = supabase.from(tabla).select('*').eq('user_id', userId);
      if (ultimaSync) query = query.gt('updated_at', ultimaSync);

      const { data, error } = await query;
      if (error) return { ok: false, error: error.message };

      for (const remoto of data ?? []) {
        await fusionarFila(tabla, remoto);
      }
    }

    await escribirMeta('ultima_sync', ahoraUTC());
    return { ok: true, fallidas };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

function prepararParaNube(tabla: string, fila: any) {
  const base: any = {
    id: fila.id,
    user_id: fila.user_id,
    created_at: fila.created_at,
    updated_at: fila.updated_at,
    deleted_at: fila.deleted_at,
  };
  if (tabla === 'items') {
    return {
      ...base,
      title: fila.title,
      type: fila.type,
      goal: fila.goal,
      sort_order: fila.sort_order,
      is_active: fila.is_active === 1,
    };
  }
  return {
    ...base,
    item_id: fila.item_id,
    day: fila.day,
    done: fila.done === 1,
    value: fila.value,
    note: fila.note,
  };
}

async function fusionarFila(tabla: string, remoto: any) {
  const db = await getDb();
  const local: any = await db.getFirstAsync(
    `SELECT updated_at, dirty FROM ${tabla} WHERE id = ?`,
    [remoto.id]
  );

  // Si la fila local tiene cambios sin subir, no la pises
  if (local?.dirty === 1) return;

  // Si el remoto es más nuevo (o no existe local), aplica el remoto
  if (!local || remoto.updated_at > local.updated_at) {
    if (tabla === 'items') {
      await db.runAsync(
        `INSERT OR REPLACE INTO items
          (id, user_id, title, type, goal, sort_order, is_active, created_at, updated_at, deleted_at, dirty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [remoto.id, remoto.user_id, remoto.title, remoto.type, remoto.goal ?? null,
         remoto.sort_order ?? 0, remoto.is_active ? 1 : 0,
         remoto.created_at, remoto.updated_at, remoto.deleted_at ?? null]
      );
    } else {
      await db.runAsync(
        `INSERT OR REPLACE INTO check_ins
          (id, user_id, item_id, day, done, value, note, created_at, updated_at, deleted_at, dirty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [remoto.id, remoto.user_id, remoto.item_id, remoto.day, remoto.done ? 1 : 0,
         remoto.value ?? null, remoto.note ?? null,
         remoto.created_at, remoto.updated_at, remoto.deleted_at ?? null]
      );
    }
  }
}

async function leerMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const r: any = await db.getFirstAsync(
    `SELECT value FROM sync_meta WHERE key = ?`,
    [key]
  );
  return r?.value ?? null;
}

async function escribirMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)`,
    [key, value]
  );
}