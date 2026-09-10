import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center bg-noche-fondo px-6">
      <Text className="text-3xl font-bold text-white mb-2">
        Mi tracker de estudio
      </Text>
      <Text className="text-noche-acento mb-8">
        Entra para ver tu progreso
      </Text>

      <TextInput
        className="bg-noche-card text-white rounded-xl px-4 py-3 mb-3"
        placeholder="Correo"
        placeholderTextColor="#7C93C3"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="bg-noche-card text-white rounded-xl px-4 py-3 mb-4"
        placeholder="Contraseña"
        placeholderTextColor="#7C93C3"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text className="text-red-400 mb-3 text-sm">{error}</Text>}

      <Pressable
        className="bg-noche-acento rounded-xl py-4 items-center active:opacity-70"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#0F1729" />
          : <Text className="text-noche-fondo font-bold text-base">Entrar</Text>}
      </Pressable>
    </View>
  );
}