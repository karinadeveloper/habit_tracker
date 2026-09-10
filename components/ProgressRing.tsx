import { Text, View } from 'react-native';

export function ProgressRing({ porcentaje }: { porcentaje: number }) {
  const size = 120;
  const grosor = 12;
  const segmentos = 48;
  const activos = Math.round((porcentaje / 100) * segmentos);

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      {Array.from({ length: segmentos }).map((_, i) => {
        const angulo = (i / segmentos) * 360 - 90;
        const rad = (angulo * Math.PI) / 180;
        const radio = size / 2 - grosor / 2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: 3,
              height: grosor,
              borderRadius: 2,
              backgroundColor: i < activos
                ? 'rgba(255,255,255,0.9)'
                : 'rgba(255,255,255,0.15)',
              transform: [
                { translateX: Math.cos(rad) * radio },
                { translateY: Math.sin(rad) * radio },
                { rotate: `${angulo + 90}deg` },
              ],
            }}
          />
        );
      })}
      <Text className="text-white font-bold" style={{ fontSize: 28 }}>
        {porcentaje}%
      </Text>
    </View>
  );
}