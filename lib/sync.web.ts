import type { SyncResult } from './sync.native';

export async function sincronizar(_userId: string): Promise<SyncResult> {
  return { ok: true, fallidas: 0 };
}