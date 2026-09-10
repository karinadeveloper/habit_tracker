import { Pressable, Text, View } from 'react-native';
import { esMesActual, mesAnterior, mesSiguiente, nombreMes } from '../lib/dates';

type Props = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
};

export function MonthSelector({ year, month, onChange }: Props) {
  const anterior = mesAnterior(year, month);
  const siguiente = mesSiguiente(year, month);
  const enActual = esMesActual(year, month);

  return (
    <View className="flex-row items-center justify-between mb-4">
      <Pressable
        onPress={() => onChange(anterior.year, anterior.month)}
        className="bg-noche-card rounded-xl w-10 h-10 items-center justify-center active:opacity-60"
      >
        <Text className="text-white text-lg">‹</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          const hoy = new Date();
          onChange(hoy.getFullYear(), hoy.getMonth() + 1);
        }}
        className="items-center active:opacity-60"
      >
        <Text className="text-xl font-bold text-white capitalize">
          {nombreMes(year, month)}
        </Text>
        {!enActual && (
          <Text className="text-noche-acento" style={{ fontSize: 10 }}>
            volver al mes actual
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => onChange(siguiente.year, siguiente.month)}
        className="bg-noche-card rounded-xl w-10 h-10 items-center justify-center active:opacity-60"
      >
        <Text className="text-white text-lg">›</Text>
      </Pressable>
    </View>
  );
}