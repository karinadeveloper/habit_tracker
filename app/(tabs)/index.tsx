import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { MonthGrid } from '../../components/MonthGrid';
import { MonthSelector } from '../../components/MonthSelector';
import { Screen } from '../../components/Screen';
import { SyncStatus } from '../../components/SyncStatus';
import { useAuth } from '../../hooks/useAuth';
import { useAutoSync } from '../../hooks/useAutoSync';
import { useCheckIns } from '../../hooks/useCheckIns';
import { useItems } from '../../hooks/useItems';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { useSync } from '../../hooks/useSync';

export default function Home() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth() + 1);

  const { sync, sincronizando, ultimoError, pendientes, fallidas } = useSync(userId);
  const { items, loading, refetch: refetchItems, aplicarCambioRemoto: aplicarItem } = useItems(userId);
  const { isChecked, toggleCheckIn, loading: loadingChecks, refetch: refetchChecks, aplicarCambioRemoto: aplicarCheck } = useCheckIns(userId, year, month);

  // --- sync debounced (declarado ANTES de usarse) ---
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncDebounced = useCallback(() => {
    if (Platform.OS === 'web') return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      sync();
    }, 1000);
  }, [sync]);

  const handleToggle = useCallback((itemId: string, day: string) => {
    toggleCheckIn(itemId, day);
    syncDebounced();
  }, [toggleCheckIn, syncDebounced]);

  // al cambiar de mes en móvil, baja de la nube antes de leer local
  const cambiarMes = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  useAutoSync(userId, async () => {
    await sync();
    await refetchItems();
    await refetchChecks();
  });

  useEffect(() => {
    if (!userId) return;
    (async () => {
      await sync();
      await refetchItems();
      await refetchChecks();
    })();
  }, [userId]);

  useRealtimeSync(userId, (tabla, payload) => {
    if (tabla === 'items') aplicarItem(payload);
    else aplicarCheck(payload);
  });

  return (
    <Screen>
      <View className="flex-1 pt-14 px-4">
        <AppHeader title="Inicio" />
        <MonthSelector year={year} month={month} onChange={cambiarMes} />
        {loading || loadingChecks ? (
          <ActivityIndicator color="#7C93C3" className="mt-8" />
        ) : items.length === 0 ? (
          <Text className="text-noche-acento text-center mt-8">Sin temas</Text>
        ) : (
          <MonthGrid
            items={items}
            year={year}
            month={month}
            isChecked={isChecked}
            onToggle={handleToggle}
          />
        )}
      </View>
      <View className="flex-row items-center justify-between mb-2">
        <SyncStatus
          sincronizando={sincronizando}
          pendientes={pendientes}
          fallidas={fallidas}
          ultimoError={ultimoError}
          onSync={async () => {
            await sync();
            await refetchItems();
            await refetchChecks();
          }}
        />
      </View>
    </Screen>
  );
}