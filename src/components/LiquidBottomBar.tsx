import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  withSpring, 
  useAnimatedStyle 
} from 'react-native-reanimated';

const { width: windowWidth } = Dimensions.get('window');
const BAR_WIDTH = windowWidth - 48;
const BAR_HEIGHT = 64;
const TAB_WIDTH = BAR_WIDTH / 4;

type Props = {
  onTabChange: (index: number) => void;
  paginaActual: number;
};

export function LiquidBottomBar({ onTabChange, paginaActual }: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(paginaActual * TAB_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(paginaActual * TAB_WIDTH, {
      damping: 25,     // More damping = less oscillation
      stiffness: 200,  // Higher stiffness = moves faster to destination
      mass: 0.5,       // Lower mass = lighter feel, stops quicker
    });
  }, [paginaActual]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const items = [
    { iconActive: 'compass', iconInactive: 'compass-outline', index: 0 },
    { iconActive: 'library', iconInactive: 'library-outline', index: 1 },
    { iconActive: 'layers', iconInactive: 'layers-outline', index: 2 },
    { iconActive: 'people', iconInactive: 'people-outline', index: 3 },
  ] as const;

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 20) }]}>
      {/* 🔮 Real Refraction Layer (Native Blur) */}
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.glassOverlay} />
      </BlurView>

      <View style={styles.content}>
        {/* 💊 Premium Pill Indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {items.map((item) => {
          const isActive = paginaActual === item.index;
          return (
            <Pressable
              key={item.index}
              onPress={() => onTabChange(item.index)}
              style={styles.tabBtn}
              hitSlop={8}
            >
              <Ionicons
                name={isActive ? item.iconActive : item.iconInactive}
                size={26}
                color={isActive ? '#ffffff' : 'rgba(255,255,255,0.4)'}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: BAR_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 1000,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    width: 64, // Tablet width
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    left: (TAB_WIDTH - 64) / 2, // Centered in the tab
  },
  tabBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
