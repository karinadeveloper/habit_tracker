import { Text, View } from 'react-native';

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 bg-white/10 rounded-2xl p-4 mr-2">
      <Text className="text-white/60" style={{ fontSize: 11 }}>{label}</Text>
      <Text className="text-white font-bold" style={{ fontSize: 24 }}>{value}</Text>
    </View>
  );
}