import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export function AppHeader({ title }: { title: string }) {
  const { signOut } = useAuth();

  return (
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-xl font-bold text-white">{title}</Text>
      <Pressable onPress={signOut} hitSlop={8} className="px-2 py-1 active:opacity-60">
        <Text className="text-white/70 text-xs">Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
