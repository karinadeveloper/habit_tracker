import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import "../global.css";
import { useAuth } from '../hooks/useAuth';
import { ThemeProvider } from '../lib/theme';
import Login from './login';

function Contenido() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-noche-fondo">
        <ActivityIndicator color="#7C93C3" />
      </View>
    );
  }

  if (!session) return <Login />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Contenido />
    </ThemeProvider>
  );
}