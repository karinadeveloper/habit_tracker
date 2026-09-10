import type { CheckIn, Item, ItemType } from './database.types';
import { getDb } from './db';
import { ahoraUTC } from './time';
import { uuid } from './uuid';

const ahora = ahoraUTC;

function filaAItem(r: any): Item {
  return {
    id: r.id,
    user_id: r.user_id,
    title: r.title,
    type: r.type as ItemType,
    goal: r.goal,
    sort_order: r.sort_order,
    is_active: r.is_active === 1,
    created_at: r.created_at,
    updated_at: r.updated_at,
    deleted_at: r.deleted_at,
  };
}

function filaACheckIn(r: any): CheckIn {
  return {
    id: r.id,
    user_id: r.user_id,
    item_id: r.item_id,
    day: r.day,
    done: r.done === 1,
    value: r.value,
    note: r.note,
    created_at: r.created_at,
    updated_at: r.updated_at,
    deleted_at: r.deleted_at,
  };
}

export async function listarItems(userId: string): Promise<Item[]> {
  const db = await getDb();
  const filas = await db.getAllAsync(
    `SELECT * FROM items
     WHERE user_id = ? AND deleted_at IS NULL AND is_active = 1
     ORDER BY sort_order ASC, created_at ASC`,
    [userId]
  );
  return filas.map(filaAItem);
}

export async function crearItem(
  userId: string,
  title: string,
  type: ItemType,
  goal?: number
): Promise<Item> {
  const db = await getDb();
  const id = uuid();
  const t = ahora();
  await db.runAsync(
    `INSERT INTO items
       (id, user_id, title, type, goal, sort_order, is_active, created_at, updated_at, dirty)
     VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, 1)`,
    [id, userId, title, type, goal ?? null, t, t]
  );
  const fila = await db.getFirstAsync(`SELECT * FROM items WHERE id = ?`, [id]);
  return filaAItem(fila);
}

export async function borrarItem(id: string): Promise<void> {
  const db = await getDb();
  const t = ahora();
  await db.runAsync(
    `UPDATE items SET deleted_at = ?, updated_at = ?, dirty = 1 WHERE id = ?`,
    [t, t, id]
  );
}

export async function listarCheckIns(
  userId: string,
  desde: string,
  hasta: string
): Promise<CheckIn[]> {
  const db = await getDb();
  const filas = await db.getAllAsync(
    `SELECT * FROM check_ins
     WHERE user_id = ? AND day >= ? AND day <= ? AND deleted_at IS NULL`,
    [userId, desde, hasta]
  );
  return filas.map(filaACheckIn);
}

export async function alternarCheckIn(
  userId: string,
  itemId: string,
  day: string
): Promise<CheckIn> {
  const db = await getDb();
  const t = ahora();

  const existente: any = await db.getFirstAsync(
    `SELECT * FROM check_ins WHERE item_id = ? AND day = ?`,
    [itemId, day]
  );

  if (existente) {
    const nuevo = existente.done === 1 ? 0 : 1;
    await db.runAsync(
      `UPDATE check_ins SET done = ?, updated_at = ?, deleted_at = NULL, dirty = 1
       WHERE id = ?`,
      [nuevo, t, existente.id]
    );
  } else {
    await db.runAsync(
      `INSERT INTO check_ins
         (id, user_id, item_id, day, done, created_at, updated_at, dirty)
       VALUES (?, ?, ?, ?, 1, ?, ?, 1)`,
      [uuid(), userId, itemId, day, t, t]
    );
  }

  const fila = await db.getFirstAsync(
    `SELECT * FROM check_ins WHERE item_id = ? AND day = ?`,
    [itemId, day]
  );
  return filaACheckIn(fila);
}

export async function contarPendientes(): Promise<number> {
  const db = await getDb();
  const a: any = await db.getFirstAsync(
    `SELECT COUNT(*) as n FROM items WHERE dirty = 1`
  );
  const b: any = await db.getFirstAsync(
    `SELECT COUNT(*) as n FROM check_ins WHERE dirty = 1`
  );
  return (a?.n ?? 0) + (b?.n ?? 0);
}

export async function fusionarDesdeNube(remoto: any): Promise<void> {
  const db = await getDb();
  const local: any = await db.getFirstAsync(
    `SELECT updated_at, dirty FROM check_ins WHERE id = ?`,
    [remoto.id]
  );

  // No pises cambios locales sin subir
  if (local?.dirty === 1) return;

  // Aplica solo si el remoto es más nuevo o no existe local
  if (!local || remoto.updated_at > local.updated_at) {
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