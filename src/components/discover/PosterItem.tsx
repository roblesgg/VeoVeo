import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { posterUrl } from '../../services/tmdbClient';
import type { Movie } from '../../types/tmdb';
import { PLATAFORMAS_DEFS } from '../../screens/AjustesScreen';

type Props = {
  item: Movie;
  onPeliculaClick: (id: number) => void;
  misPlataformas?: number[];
};

export const PosterItem = memo(({ item, onPeliculaClick, misPlataformas = [] }: Props) => {
  const isFlatrate = item.providers?.flatrate?.some(p => misPlataformas.includes(p));
  const isRent = !isFlatrate && item.providers?.rent?.some(p => misPlataformas.includes(p));

  return (
    <View style={styles.posterWrapper}>
      <Pressable
        onPress={() => onPeliculaClick(item.id)}
        style={({ pressed }) => [
          styles.posterCard,
          { transform: [{ scale: pressed ? 0.96 : 1 }] }
        ]}
      >
        {posterUrl(item.poster_path, 'w342') ? (
          <Image
            source={{ uri: posterUrl(item.poster_path, 'w342')! }}
            style={styles.posterImg}
          />
        ) : (
          <View style={[styles.posterImg, styles.posterFallback]}>
            <Ionicons name="film-outline" size={32} color="rgba(255,255,255,0.1)" />
            <Text style={styles.fallbackText}>{item.title}</Text>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={StyleSheet.absoluteFill}
        />
        
        {(isFlatrate || isRent) && (
          <View style={[
            styles.dot, 
            { backgroundColor: isFlatrate ? '#2ecc71' : '#f39c12' }
          ]} />
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  posterWrapper: { width: 130, height: 190 },
  posterCard: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1e1e2d' },
  posterImg: { width: '100%', height: '100%' },
  posterFallback: { justifyContent: 'center', alignItems: 'center' },
  fallbackText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', padding: 8 },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3
  }
});
