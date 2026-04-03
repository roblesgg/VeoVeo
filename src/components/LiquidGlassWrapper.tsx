import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';

interface LiquidGlassWrapperProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  borderRadius?: number;
  borderWidth?: number;
  tint?: 'dark' | 'light' | 'default';
}

/**
 * LiquidGlassWrapper: A high-end glassmorphism component with layered effects.
 * It uses 5 layers to simulate real glass refraction and lighting.
 */
export const LiquidGlassWrapper: React.FC<LiquidGlassWrapperProps> = ({
  children,
  style,
  intensity = 95,
  borderRadius = 32,
  borderWidth = 1,
  tint = 'dark',
}) => {
  return (
    <View style={[styles.outerGlow, { borderRadius }, style]}>
      {/* Layer 1: The Blur Effect */}
      <BlurView intensity={intensity} tint={tint} style={[styles.blur, { borderRadius }]}>
        
        {/* Layer 2: Subtle Brand Color Wash (prevents grayness) */}
        <LinearGradient
          colors={['rgba(14, 165, 233, 0.08)', 'rgba(2, 6, 23, 0.4)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Layer 3: Inner Glass Highlight (Top light reflection) */}
        <View 
          style={[
            styles.innerHighlight, 
            { borderRadius, borderTopWidth: 0.5, borderColor: 'rgba(255, 255, 255, 0.2)' }
          ]} 
        />

        {/* Layer 4: Structural Border Gradient */}
        <View 
          style={[
            styles.glassBorder, 
            { borderRadius, borderWidth, borderColor: 'rgba(255, 255, 255, 0.1)' }
          ]} 
        />

        {/* Layer 5: Children Content */}
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerGlow: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blur: {
    flex: 1,
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
});
