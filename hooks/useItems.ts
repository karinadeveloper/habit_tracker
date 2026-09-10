
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { Item, ItemType } from '../lib/database.types';
import { LOCAL_DB_DISPONIBLE } from '../lib/db';
import * as local from '../lib/localRepo';
import { supabase } from '../lib/supabase';
import { ahoraUTC } from '../lib/time';

export function useItems(userId: string | undefined) {
  const USAR_LOCAL = Platform.OS !== 'web';
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchItems() {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    if (LOCAL_DB_DISPONIBLE) {
      try {
        setItems(await local.listarItems(userId));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setItems(data ?? []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [userId]);

  async function addItem(title: string, type: ItemType, goal?: number) {
    if (!userId) return null;

    if (LOCAL_DB_DISPONIBLE) {
      const nuevo = await local.crearItem(userId, title, type, goal);
      setItems((prev) => [...prev, nuevo]);
      return nuevo;
    }

    const { data, error } = await supabase
      .from('items')
      .insert({ user_id: userId, title, type, goal })
      .select()
      .single();

    if (error) { setError(error.message); return null; }
    setItems((prev) => [...prev, data as Item]);
    return data;
  }

  async function deleteItem(id: string) {
    if (LOCAL_DB_DISPONIBLE) {
      await local.borrarItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    await supabase
      .from('items')
      .update({ deleted_at: ahoraUTC() })
      .eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function updateItem(id: string, changes: Partial<Item>) {
    const { data } = await supabase
      .from('items')
      .update({ ...changes, updated_at: ahoraUTC() })
      .eq('id', id)
      .select()
      .single();
    if (data) {
      setItems((prev) => prev.map((i) => (i.id === id ? (data as Item) : i)));
    }
    return data;
  }

  function aplicarCambioRemoto(payload: any) {
    const fila = payload.new;
    if (!fila || !fila.id) return;

    setItems((prev) => {
      if (fila.deleted_at || fila.is_active === false) {
        return prev.filter((i) => i.id !== fila.id);
      }
      const nueva = { ...fila, is_active: !!fila.is_active } as Item;
      const existe = prev.some((i) => i.id === fila.id);
      return existe
        ? prev.map((i) => (i.id === fila.id ? nueva : i))
        : [...prev, nueva];
    });
  }

  return { items, loading, error, addItem, deleteItem, updateItem, refetch: fetchItems, aplicarCambioRemoto };
}