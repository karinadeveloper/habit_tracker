import type { CheckIn, Item, ItemType } from './database.types';

const noWeb = (): never => {
  throw new Error('localRepo no disponible en web');
};

export async function listarItems(_userId: string): Promise<Item[]> { return noWeb(); }
export async function crearItem(_u: string, _t: string, _ty: ItemType, _g?: number): Promise<Item> { return noWeb(); }
export async function borrarItem(_id: string): Promise<void> { return noWeb(); }
export async function listarCheckIns(_u: string, _d: string, _h: string): Promise<CheckIn[]> { return noWeb(); }
export async function alternarCheckIn(_u: string, _i: string, _d: string): Promise<CheckIn> { return noWeb(); }
export async function contarPendientes(): Promise<number> { return 0; }
export async function fusionarDesdeNube(_remoto: any): Promise<void> {}