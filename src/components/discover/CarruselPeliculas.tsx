import React, { memo, useEffect, useState, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { PosterItem } from './PosterItem';
import type { Movie } from '../../types/tmdb';
import { ErrorRed, AccentColor } from '../../theme/colors';

type Props = {
  titulo: string;
  modoEdicion: boolean;
  fontFamily: string;
  peliculas: Movie[];
  cargarCarrusel: (titulo: string, forzar?: boolean) => void;
  onEliminar: () => void;
  onPeliculaClick: (id: number) => void;
  drag: () => void;
  isActive: boolean;
  misPlataformas?: number[];
};

export const CarruselPeliculas = memo(({
  titulo,
  modoEdicion,
  fontFamily,
  peliculas,
  cargarCarrusel,
  onEliminar,
  onPeliculaClick,
  drag,
  isActive,
  misPlataformas = [],
}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const lastCall = useRef(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (peliculas.length === 0) cargarCarrusel(titulo);
  }, [titulo, peliculas.length, cargarCarrusel]);

  const handleManualRefresh = () => {
    if (refreshing) return;
    const now = Date.now();
    if (now - lastCall.current > 2000) {
      lastCall.current = now;
      setRefreshing(true);
      cargarCarrusel(titulo, true);
      // Auto-scroll back to start after a delay
      setTimeout(() => {
        setRefreshing(false);
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 1500);
    }
  };

  return (
    <View style={{ marginBottom: 28, opacity: isActive ? 0.5 : 1 }}>
      <View style={styles.carruselHeader}>
        <Pressable 
          onLongPress={drag} 
          delayLongPress={200}
          style={styles.carruselTitleContainer}
        >
          <Text style={[styles.carruselTitulo, { fontFamily }]}>{titulo}</Text>
          {modoEdicion && (
            <Animated.View entering={FadeInRight}>
              <Ionicons name="reorder-two-outline" size={20} color="rgba(255,255,255,0.4)" style={{ marginLeft: 8 }} />
            </Animated.View>
          )}
        </Pressable>
        {modoEdicion && (
          <Pressable onPress={onEliminar} hitSlop={12} style={styles.eliminarBtn}>
            <Ionicons name="close-circle" size={24} color={ErrorRed} />
          </Pressable>
        )}
      </View>
      
      <FlatList
        ref={listRef}
        horizontal
        data={peliculas}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 25, gap: 14 }}
        nestedScrollEnabled={true}
        removeClippedSubviews={true}
        initialNumToRender={5}
        overScrollMode="always"
        ListFooterComponent={() => (
          <Pressable 
            onPress={handleManualRefresh}
            style={({ pressed }) => [
              styles.footerCard,
              { transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
          >
            <View style={styles.footerCircle}>
              <Ionicons 
                name={refreshing ? "sync" : "refresh"} 
                size={28} 
                color={AccentColor} 
              />
            </View>
            <Text style={[styles.footerText, { fontFamily }]}>
              {refreshing ? 'Nuevas...' : 'Recargar'}
            </Text>
          </Pressable>
        )}
        renderItem={({ item }) => (
          <PosterItem item={item} onPeliculaClick={onPeliculaClick} misPlataformas={misPlataformas} />
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  carruselHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 12 },
  carruselTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  carruselTitulo: { color: '#fff', fontSize: 20, fontWeight: '700' },
  eliminarBtn: { padding: 4 },
  footerCard: { 
    width: 100, 
    height: 150, // Match PosterItem height approx
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    marginRight: 25,
    marginLeft: 5
  },
  footerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)'
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  }
});
