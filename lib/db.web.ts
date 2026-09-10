import type * as SQLite from 'expo-sqlite';

export const LOCAL_DB_DISPONIBLE = false;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  throw new Error('SQLite no disponible en web');
}