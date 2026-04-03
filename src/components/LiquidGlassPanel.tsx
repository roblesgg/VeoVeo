import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { GLASS } from '../theme/colors';
import { SHADOWS } from '../theme/theme';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  rounded?: boolean;
};

export function LiquidGlassPanel({
  children,
  style,
  contentStyle,
  intensity = 90,
  rounded = true,
}: Props) {
  return (
    <View style={[styles.shell, rounded && styles.rounded, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />

      <LinearGradient
        colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0.08)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0.3)', 'transparent']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.6, y: 0.55 }}
        style={styles.highlight}
      />

      <View style={styles.edgeGlow} pointerEvents="none" />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    ...SHADOWS.macLight,
  },
  rounded: {
    borderRadius: 28,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: '8%',
    right: '8%',
    height: '48%',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    opacity: 0.8,
  },
  edgeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 28,
  },
});
