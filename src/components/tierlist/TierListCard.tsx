import React from 'react';
import { Image, StyleSheet, Text, View, Pressable } from 'react-native';
import { posterUrl } from '../../services/tmdbClient';
import type { TierList, PeliculaUsuario } from '../../types';
import { todasLasPeliculasTierList } from '../../types';
import { CardSurface } from '../../theme/colors';
import { SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  tier: TierList;
  peliculasMap: Record<number, PeliculaUsuario>;
  onPress: () => void;
  fontFamily: string;
};

export const TierListCard = React.memo(({ tier, peliculasMap, onPress, fontFamily }: Props) => {
  const renderCover = () => {
    if (tier.portadaUrl) {
      return (
        <View style={styles.cover}>
          <Image source={{ uri: tier.portadaUrl }} style={styles.coverImg} />
        </View>
      );
    }

    const primeras = todasLasPeliculasTierList(tier).slice(0, 4);
    if (primeras.length === 0) {
      return (
        <View style={[styles.cover, styles.posterFallback]}>
          <Text style={[styles.coverEmptyText, { fontFamily }]}>Vacía</Text>
        </View>
      );
    }

    return (
      <View style={styles.coverGrid}>
        {Array.from({ length: 4 }).map((_, idx) => {
          const movieId = primeras[idx];
          const p = movieId ? peliculasMap[movieId] : null;
          return (
            <View key={idx} style={styles.coverCell}>
              {p?.rutaPoster ? (
                <Image source={{ uri: posterUrl(p.rutaPoster, 'w185')! }} style={styles.coverImg} />
              ) : (
                <View style={[styles.coverImg, styles.posterFallback]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.outer}>
      <Pressable style={[styles.container, SHADOWS.macLight]} onPress={onPress}>
        {renderCover()}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        >
          <Text style={[styles.title, { fontFamily }]} numberOfLines={2}>
            {tier.nombre}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    aspectRatio: 0.85, // 🚀 Más alta para mayor impacto visual
    padding: 2, 
  },
  container: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#1E1E2D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
    backgroundColor: CardSurface,
  },
  coverGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: CardSurface,
  },
  coverCell: { width: '50%', height: '50%' },
  coverImg: { width: '100%', height: '100%' },
  posterFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: CardSurface },
  coverEmptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  title: {
    color: '#fff',
    fontSize: 17, // 🚀 Más grande
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
