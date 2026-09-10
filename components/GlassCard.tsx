import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';

export function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  if (Platform.OS === 'web') {
    return (
      <View
        className={`rounded-2xl overflow-hidden ${className}`}
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={40}
      tint="dark"
      className={`rounded-2xl overflow-hidden ${className}`}
    >
      {children}
    </BlurView>
  );
}