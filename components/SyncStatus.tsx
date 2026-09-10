import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Props = {
  sincronizando: boolean;
  pendientes: number;
  fallidas: number;
  ultimoError: string | null;
  onSync: () => void;
};

export function SyncStatus({ sincronizando, pendientes, fallidas, ultimoError, onSync }: Props) {
  let texto = 'Todo sincronizado';
  let color = 'rgba(255,255,255,0.6)';

  if (sincronizando) {
    texto = 'Sincronizando…';
  } else if (fallidas > 0) {
    texto = `${fallidas} con error · reintentar`;
    color = '#F0997B';
  } else if (pendientes > 0) {
    texto = `${pendientes} sin subir · sincronizar`;
    color = '#FAC775';
  }

  return (
    <Pressable
      onPress={onSync}
      disabled={sincronizando}
      className="flex-row items-center active:opacity-60"
    >
      {sincronizando && (
        <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 6 }} />
      )}
      <View
        style={{
          width: 8, height: 8, borderRadius: 4, marginRight: 6,
          backgroundColor: pendientes > 0 || fallidas > 0 ? color : '#5DCAA5',
        }}
      />
      <Text style={{ color, fontSize: 12 }}>{texto}</Text>
    </Pressable>
  );
}