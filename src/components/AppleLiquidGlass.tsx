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

interface AppleLiquidGlassProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  blurAmount?: number;
  saturation?: number;
  distortion?: number;
  aberration?: number;
}

// THE ELITE SAUCE: Advanced Apple Refraction Shader
const source = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform float2 size;
  uniform float distortion;
  uniform float aberration;

  half4 main(float2 pos) {
    float2 center = size / 2.0;
    float2 off = pos - center;
    float d = length(off);
    float maxD = length(center);
    
    // Lens distortion (bending)
    float f = 1.0 + distortion * (d / maxD);
    float2 uv = center + off * f;
    
    // Chromatic Aberration (R/G/B Splitting)
    float2 rUV = center + off * (f + aberration * 0.005);
    float2 bUV = center + off * (f - aberration * 0.005);
    
    half r = image.eval(rUV).r;
    half g = image.eval(uv).g;
    half b = image.eval(bUV).b;
    half a = image.eval(uv).a;
    
    return half4(r, g, b, a);
  }
`)!;

export const AppleLiquidGlass: React.FC<AppleLiquidGlassProps> = ({
  children,
  style,
  borderRadius = 32,
  blurAmount = 25,
  saturation = 1.35,
  distortion = 0.08,
  aberration = 1.2,
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
            {/* The Lens Refraction Backdrop */}
            <RoundedRect
              x={0}
              y={0}
              width={layout.width}
              height={layout.height}
              r={borderRadius}
              color="transparent"
            >
              <BackdropFilter filter={
                <Blur blur={blurAmount}>
                  <ColorMatrix matrix={matrix} />
                </Blur>
              }>
                <RuntimeShader 
                  source={source} 
                  uniforms={{ 
                    size: vec(layout.width, layout.height),
                    distortion: distortion,
                    aberration: aberration
                  }} 
                />
              </BackdropFilter>
              
              {/* Layer 2: Ultra-Translucent Midnight Deep Tint */}
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, layout.height)}
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(2, 6, 23, 0.12)']}
              />
            </RoundedRect>

            {/* Layer 3: Crystal Perimeter Highlight */}
            <RoundedRect
              x={0}
              y={0}
              width={layout.width}
              height={layout.height}
              r={borderRadius}
              color="transparent"
            >
               <LinearGradient
                start={vec(0, 0)}
                end={vec(0, layout.height)}
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.02)']}
              />
               <View 
                style={[
                  StyleSheet.absoluteFill, 
                  { 
                    borderWidth: 1.2, 
                    borderColor: 'rgba(255,255,255,0.08)', 
                    borderRadius 
                  }
                ]} 
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
