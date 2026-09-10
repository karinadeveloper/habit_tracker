import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../hooks/useAuth';
import { useItems } from '../../hooks/useItems';
import { BACKGROUNDS, type BackgroundKey } from '../../lib/backgrounds';
import type { ItemType } from '../../lib/database.types';
import { useTheme } from '../../lib/theme';


const TIPOS: { key: ItemType; label: string }[] = [
  { key: 'libro', label: 'Libro' },
  { key: 'curso', label: 'Curso' },
  { key: 'tema', label: 'Tema' },
];

export default function Temas() {
  const { session, signOut } = useAuth();
  const userId = session?.user.id;
  const { items, loading, addItem, deleteItem } = useItems(userId);

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<ItemType>('tema');
  const [meta, setMeta] = useState('');

  const { bg, setBg } = useTheme();

  async function handleAdd() {
    if (!titulo.trim()) return;
    const goal = meta ? parseInt(meta, 10) : undefined;
    await addItem(titulo.trim(), tipo, goal);
    setTitulo('');
    setMeta('');
  }

  return (
    <Screen>
      <View className="flex-1 pt-14 px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-white">Mis temas</Text>
          <Pressable onPress={signOut}>
            <Text className="text-white/70 text-xs">Salir</Text>
          </Pressable>
        </View>

        <View className="flex-row mb-4">
          {(Object.keys(BACKGROUNDS) as BackgroundKey[]).map((k) => (
            <Pressable
              key={k}
              onPress={() => setBg(k)}
              className={`rounded-lg px-3 py-2 mr-2 ${
                bg === k ? 'bg-white/25' : 'bg-white/10'
              }`}
            >
              <Text className="text-white" style={{ fontSize: 11 }}>
                {BACKGROUNDS[k].label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="bg-white/10 rounded-2xl p-4 mb-4">
          <TextInput
            className="bg-black/25 text-white rounded-xl px-4 py-3 mb-3"
            placeholder="Título"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={titulo}
            onChangeText={setTitulo}
          />

          <View className="flex-row mb-3">
            {TIPOS.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setTipo(t.key)}
                className={`rounded-lg px-3 py-2 mr-2 ${
                  tipo === t.key ? 'bg-white/80' : 'bg-black/25'
                }`}
              >
                <Text
                  className={tipo === t.key ? 'text-black font-bold' : 'text-white'}
                  style={{ fontSize: 12 }}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            className="bg-black/25 text-white rounded-xl px-4 py-3 mb-3"
            placeholder="Meta de días al mes (opcional)"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={meta}
            onChangeText={setMeta}
            keyboardType="number-pad"
          />

          <Pressable
            className="bg-white/85 rounded-xl py-3 items-center active:opacity-70"
            onPress={handleAdd}
          >
            <Text className="text-black font-bold">Agregar</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <ScrollView>
            {items.map((item) => (
              <View
                key={item.id}
                className="bg-white/10 rounded-xl px-4 py-3 mb-2 flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="text-white">{item.title}</Text>
                  <Text className="text-white/60" style={{ fontSize: 11 }}>
                    {item.type}
                    {item.goal ? ` · meta ${item.goal} días` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => deleteItem(item.id)}
                  className="px-3 py-1 active:opacity-60"
                >
                  <Text className="text-red-300">Eliminar</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}