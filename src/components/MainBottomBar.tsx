import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { BottomBarTop, BottomBarBottom } from '../theme/colors';
import { SHADOWS } from '../theme/theme';

type Props = {
  onTabChange: (index: number) => void;
  paginaActual: number;
};

export function MainBottomBar({ onTabChange, paginaActual }: Props) {
  const insets = useSafeAreaInsets();
  const items: { iconActive: ComponentProps<typeof Ionicons>['name']; iconInactive: ComponentProps<typeof Ionicons>['name']; index: number }[] = [
    { iconActive: 'compass', iconInactive: 'compass-outline', index: 0 },
    { iconActive: 'library', iconInactive: 'library-outline', index: 1 },
    { iconActive: 'layers', iconInactive: 'layers-outline', index: 2 },
    { iconActive: 'people', iconInactive: 'people-outline', index: 3 },
  ];

  return (
    <View style={[
      styles.wrap,
      { bottom: Math.max(insets.bottom, 20) }
    ]}>
      <BlurView
        intensity={95}
        tint="dark"
        style={styles.bar}
      >
        <View style={styles.innerBar}>
          {items.map(({ iconActive, iconInactive, index }) => (
            <Pressable key={index} onPress={() => onTabChange(index)} style={styles.btn} hitSlop={12}>
              <View style={[styles.iconWrap, paginaActual === index && styles.iconWrapActive]}>
                <Ionicons 
                  name={paginaActual === index ? iconActive : iconInactive} 
                  size={26} 
                  color={paginaActual === index ? "#fff" : "rgba(255,255,255,0.6)"} 
                />
              </View>
            </Pressable>
          ))}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 100,
  },
  bar: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // Slate blue translucent
  },
  innerBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  btn: {
    padding: 6,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {}
});
