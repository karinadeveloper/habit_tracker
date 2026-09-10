import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export const LOCAL_DB_DISPONIBLE = Platform.OS !== 'web';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  goal INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  dirty INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  day TEXT NOT NULL,
  done INTEGER DEFAULT 1,
  value REAL,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  dirty INTEGER DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_item_day
  ON check_ins(item_id, day);

CREATE INDEX IF NOT EXISTS idx_checkins_day ON check_ins(day);
CREATE INDEX IF NOT EXISTS idx_items_user ON items(user_id);

CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
`;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!LOCAL_DB_DISPONIBLE) {
    throw new Error('SQLite no disponible en web');
  }
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('habits.db');
      await db.execAsync(SCHEMA);
      return db;
    })();
  }
  return dbPromise;
}