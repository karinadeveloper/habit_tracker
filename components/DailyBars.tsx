import { ScrollView, Text, View } from 'react-native';

type Dia = { dia: number; porcentaje: number };

export function DailyBars({ datos }: { datos: Dia[] }) {
  const altura = 90;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row items-end" style={{ height: altura + 18 }}>
        {datos.map((d) => (
          <View key={d.dia} className="items-center mr-1">
            <View
              style={{
                width: 8,
                height: Math.max((d.porcentaje / 100) * altura, 2),
                backgroundColor: 'rgba(255,255,255,0.75)',
                borderRadius: 4,
              }}
            />
            <Text className="text-white/40" style={{ fontSize: 8, marginTop: 3 }}>
              {d.dia}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}