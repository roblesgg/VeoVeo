import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { 
  Canvas, 
  RoundedRect, 
  BlurMask, 
  LinearGradient, 
  vec, 
  Shadow,
  BackdropBlur,
  Fill
} from '@shopify/react-native-skia';

interface Props extends ViewProps {
  intensity?: number;
  borderRadius?: number;
  borderWidth?: number;
  children?: React.ReactNode;
}

/**
 * 💠 GLASS CONTAINER NX-GEN (Powered by Skia)
 * Proporciona un efecto de cristal real mediante BackdropBlur.
 * Es la ÚNICA forma de conseguir un desenfoque fluido y real en Android.
 */
export const GlassContainer = ({ 
  intensity = 20, 
  borderRadius = 32, 
  borderWidth = 1.2,
  children, 
  style, 
  ...props 
}: Props) => {
  return (
    <View style={[styles.container, { borderRadius }, style]} {...props}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* 🔮 Real Backdrop Blur (GPU Optimized) */}
        <BackdropBlur blur={intensity} clip={{ x: 0, y: 0, width: 1000, height: 1000 }}>
          <Fill color="rgba(255, 255, 255, 0.05)" />
        </BackdropBlur>

        {/* 💎 Glass Edge & Border */}
        <RoundedRect
          x={0.5}
          y={0.5}
          width={1000} // Se recorta por el contenedor de View
          height={1000}
          r={borderRadius}
          color="transparent"
        >
          <Shadow dx={0} dy={1} blur={4} color="rgba(255, 255, 255, 0.15)" inner />
        </RoundedRect>
      </Canvas>

      {/* React Native Content Layer */}
      <View style={styles.inner}>
        {children}
      </View>

      {/* Sutil Physical Border */}
      <View style={[styles.border, { borderRadius, borderWidth }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    zIndex: 1,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    pointerEvents: 'none',
  },
});
