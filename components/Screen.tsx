import type { ReactNode } from 'react';
import { ImageBackground } from 'expo-image';
import { View } from 'react-native';
import { BACKGROUNDS } from '../lib/backgrounds';
import { useTheme } from '../lib/theme';

export function Screen({ children }: { children: ReactNode }) {
  const { bg } = useTheme();
  const config = BACKGROUNDS[bg];

  return (
    <ImageBackground
      source={config.source}
      style={{ flex: 1 }}
      contentFit="cover"
      contentPosition="bottom"
    >
      <View style={{ flex: 1, backgroundColor: config.overlay }}>
        {children}
      </View>
    </ImageBackground>
  );
}