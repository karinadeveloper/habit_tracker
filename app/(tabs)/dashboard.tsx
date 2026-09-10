import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { DailyBars } from '../../components/DailyBars';
import { MonthSelector } from '../../components/MonthSelector';
import { ProgressRing } from '../../components/ProgressRing';
import { Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { useCheckIns } from '../../hooks/useCheckIns';
import { useItems } from '../../hooks/useItems';
import { useStats } from '../../hooks/useStats';

export default function Dashboard() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth() + 1);

  const { items, loading } = useItems(userId);
  const { checkIns, loading: loadingChecks } = useCheckIns(userId, year, month);
  const stats = useStats(items, checkIns, year, month);

  return (
    <Screen>
      <ScrollView className="flex-1 pt-14 px-4">
        <AppHeader title="Progreso" />
        <MonthSelector
          year={year}
          month={month}
          onChange={(y, m) => { setYear(y); setMonth(m); }}
        />

        {loading || loadingChecks ? (
          <ActivityIndicator color="#ffffff" className="mt-8" />
        ) : (
          <>
            <View className="flex-row mb-4">
              <StatCard label="Meta" value={stats.metaTotal} />
              <StatCard label="Completado" value={stats.completados} />
              <StatCard label="Restante" value={stats.restantes} />
            </View>

            <View className="bg-white/10 rounded-2xl p-4 mb-4 items-center">
              <Text className="text-white/60 mb-3" style={{ fontSize: 11 }}>
                Progreso general
              </Text>
              <ProgressRing porcentaje={stats.porcentaje} />
              <Text className="text-white/60 mt-3" style={{ fontSize: 12 }}>
                Racha actual: {stats.rachaActual} días
              </Text>
            </View>

            <View className="bg-white/10 rounded-2xl p-4 mb-4">
              <Text className="text-white/60 mb-3" style={{ fontSize: 11 }}>
                Progreso diario
              </Text>
              <DailyBars datos={stats.porDia} />
            </View>

            <View className="bg-white/10 rounded-2xl p-4 mb-10">
              <Text className="text-white/60 mb-3" style={{ fontSize: 11 }}>
                Por tema
              </Text>
              {stats.porItem.map((it) => (
                <View key={it.id} className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-white" style={{ fontSize: 13 }} numberOfLines={1}>
                      {it.title}
                    </Text>
                    <Text className="text-white/60" style={{ fontSize: 12 }}>
                      {it.actual}/{it.meta} · {it.porcentaje}%
                    </Text>
                  </View>
                  <View className="bg-black/30 rounded-full" style={{ height: 6 }}>
                    <View
                      className="bg-white/80 rounded-full"
                      style={{ height: 6, width: `${Math.min(it.porcentaje, 100)}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}