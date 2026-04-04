import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import {
  Canvas,
  BackdropFilter,
  Blur,
  ColorMatrix,
  Group,
  RoundedRect,
  vec,
  LinearGradient,
  Skia,
  RuntimeShader,
} from '@shopify/react-native-skia';

interface PremiumGlassProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  blurAmount?: number;
  saturation?: number;
  distortion?: number;
}

const source = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform float2 size;
  uniform float distortion;

  half4 main(float2 pos) {
    float2 center = size / 2.0;
    float2 off = pos - center;
    float d = length(off);
    float maxD = length(center);
    
    // Lens Refraction logic
    float f = 1.0 + distortion * (d / maxD);
    float2 uv = center + off * f;
    
    return image.eval(uv);
  }
`)!;

export const PremiumGlass: React.FC<PremiumGlassProps> = ({
  children,
  style,
  borderRadius = 32,
  blurAmount = 25,
  saturation = 1.4,
  distortion = 0.08,
}) => {
  const [layout, setLayout] = React.useState({ width: 0, height: 0 });

  const matrix = useMemo(() => [
    saturation, 0, 0, 0, 0,
    0, saturation, 0, 0, 0,
    0, 0, saturation, 0, 0,
    0, 0, 0, 1, 0,
  ], [saturation]);

  return (
    <View 
      style={[styles.container, style]} 
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        {layout.width > 0 && (
          <Group>
            <RoundedRect
              x={0}
              y={0}
              width={layout.width}
              height={layout.height}
              r={borderRadius}
              color="transparent"
            >
              <BackdropFilter filter={<Blur blur={blurAmount}><ColorMatrix matrix={matrix} /></Blur>}>
                <RuntimeShader 
                  source={source} 
                  uniforms={{ 
                    size: vec(layout.width, layout.height),
                    distortion: distortion
                  }} 
                />
              </BackdropFilter>
              
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, layout.height)}
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(2, 6, 23, 0.12)']}
              />
            </RoundedRect>

            <RoundedRect
              x={0}
              y={0}
              width={layout.width}
              height={layout.height}
              r={borderRadius}
              color="transparent"
              strokeWidth={1.2}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 40)}
                colors={['rgba(255, 255, 255, 0.25)', 'transparent']}
              />
            </RoundedRect>
          </Group>
        )}
      </Canvas>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: 'transparent' },
  content: { flex: 1, zIndex: 10 },
});
