import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const BLOB_COLORS = [
  ['#0EA5E9', '#6366F1'], // Electric Blue to Indigo
  ['#6366F1', '#312E81'], // Indigo to Deep Purple
  ['#020617', '#0EA5E9'], // Midnight to Blue
  ['#1E293B', '#64748B'], // Slate to Light Slate
];

const AnimatedBlob = ({ 
  index, 
  colorIndex 
}: { 
  index: number; 
  colorIndex: number; 
}) => {
  const moveX = useSharedValue(Math.random() * width - width / 2);
  const moveY = useSharedValue(Math.random() * height - height / 2);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    moveX.value = withRepeat(
      withTiming(Math.random() * (width * 0.8) - width * 0.4, {
        duration: 15000 + index * 2000,
        easing: Easing.bezier(0.445, 0.05, 0.55, 0.95),
      }),
      -1,
      true
    );
    moveY.value = withRepeat(
      withTiming(Math.random() * (height * 0.8) - height * 0.4, {
        duration: 20000 + index * 1000,
        easing: Easing.bezier(0.445, 0.05, 0.55, 0.95),
      }),
      -1,
      true
    );
    scale.value = withRepeat(
      withTiming(1.5, {
        duration: 10000 + index * 1000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
    rotate.value = withRepeat(
      withTiming(360, {
        duration: 25000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: moveX.value },
      { translateY: moveY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: 0.4,
  }));

  return (
    <Animated.View style={[styles.blobContainer, animatedStyle]}>
      <LinearGradient
        colors={BLOB_COLORS[colorIndex] as any}
        style={styles.blob}
      />
    </Animated.View>
  );
};

export const LiquidMesh = () => {
  return (
    <View style={styles.container}>
      <AnimatedBlob index={0} colorIndex={0} />
      <AnimatedBlob index={1} colorIndex={1} />
      <AnimatedBlob index={2} colorIndex={2} />
      <AnimatedBlob index={3} colorIndex={3} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617', // Midnight base
    overflow: 'hidden',
  },
  blobContainer: {
    position: 'absolute',
    top: height / 2 - 300,
    left: width / 2 - 300,
    width: 600,
    height: 600,
    zIndex: -1,
  },
  blob: {
    width: 600,
    height: 600,
    borderRadius: 300,
    opacity: 0.6,
  },
});
