/**
 * ARCHIVO: components/PremiumBottomBar.tsx
 * DESCRIPCIÓN: Barra de navegación inferior personalizada 'Premium'.
 * Utiliza BlurView para el efecto cristal y React Native Reanimated para
 * una animación 'Liquid' elástica al cambiar entre pestañas.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: windowWidth } = Dimensions.get('window');
const BAR_WIDTH = windowWidth - 48; // Márgenes laterales de 24
const BAR_HEIGHT = 64;
const TAB_WIDTH = BAR_WIDTH / 4; // 4 secciones: Descubrir, Biblioteca, TierLists, Social

type Props = {
  onTabChange: (index: number) => void;
  paginaActual: number;
};

export function PremiumBottomBar({ onTabChange, paginaActual }: Props) {
  const insets = useSafeAreaInsets();
  
  // VALORES ANIMADOS (Shared Values)
  const activeX = useSharedValue(0);       // Posición horizontal de la burbuja blanca
  const stretch = useSharedValue(1);       // Factor de estiramiento horizontal (Efecto chicle)
  const scaleY = useSharedValue(1);        // Factor de compresión vertical

  useEffect(() => {
    /** 🧠 LÓGICA DE ANIMACIÓN LIQUID ELASTIC:
     * Al cambiar de pestaña, la burbuja blanca se estira hacia los lados
     * y se aplana mientras se desplaza a la nueva posición, recuperando
     * su forma circular mediante un muelle (Spring) al llegar.
     */
    const targetX = (paginaActual * TAB_WIDTH) + (TAB_WIDTH / 2) - 22;

    // Secuencia de estiramiento (X)
    stretch.value = withSequence(
      withTiming(1.6, { duration: 150 }), // Se estira durante el recorrido
      withSpring(1, { damping: 12, stiffness: 90 }) // Recupera forma con rebote
    );
    
    // Secuencia de compresión (Y)
    scaleY.value = withSequence(
      withTiming(0.65, { duration: 150 }), // Se aplana
      withSpring(1, { damping: 12, stiffness: 90 }) // Vuelve a ser alta
    );

    // Movimiento fluido de la posición X
    activeX.value = withSpring(targetX, {
      damping: 18,
      stiffness: 120,
      mass: 0.8
    });
  }, [paginaActual]);

  // Aplicación de transformaciones a la burbuja indicadora
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: activeX.value },
      { scaleX: stretch.value },
      { scaleY: scaleY.value },
    ],
  }));

  // Definición de las pestañas
  const items = [
    { iconActive: 'compass', iconInactive: 'compass-outline', index: 0 },
    { iconActive: 'library', iconInactive: 'library-outline', index: 1 },
    { iconActive: 'layers', iconInactive: 'layers-outline', index: 2 },
    { iconActive: 'people', iconInactive: 'people-outline', index: 3 },
  ] as const;

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 20) }]}>
      {/* 🔮 FONDO: Glassmorphism real con BlurView */}
      <BlurView intensity={90} tint="dark" style={styles.blurBackground}>
        <View style={styles.innerContainer}>
          
          {/* 💧 INDICADOR LÍQUIDO (Burbuja blanca que viaja) */}
          <Animated.View style={[styles.indicator, indicatorStyle]}>
            <LinearGradient
              colors={['#fff', 'rgba(255, 255, 255, 0.4)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Pequeño reflejo para simular volumen 3D */}
            <View style={styles.specular} />
          </Animated.View>

          {/* ICONOS INTERACTIVOS */}
          {items.map((item) => {
            const isActive = paginaActual === item.index;
            return (
              <Pressable
                key={item.index}
                onPress={() => onTabChange(item.index)}
                style={styles.tabBtn}
                hitSlop={12}
              >
                <AnimatedIcon 
                  name={isActive ? item.iconActive : item.iconInactive} 
                  isActive={isActive} 
                />
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

/** Componente interno para animar individualmente los iconos */
function AnimatedIcon({ name, isActive }: { name: any, isActive: boolean }) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Si el icono se activa, salta y crece un poco
    if (isActive) {
      scale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
      translateY.value = withSpring(-4, { damping: 10, stiffness: 200 });
    } else {
      scale.value = withSpring(1);
      translateY.value = withSpring(0);
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons
        name={name}
        size={24}
        color={isActive ? '#020617' : 'rgba(255, 255, 255, 0.45)'}
      />
    </Animated.View>
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
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  specular: {
    position: 'absolute',
    top: 4,
    left: 8,
    width: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  tabBtn: {
    width: TAB_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
