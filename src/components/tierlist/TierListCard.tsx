import React from 'react';
import { Image, StyleSheet, Text, View, Pressable } from 'react-native';
import { posterUrl } from '../../services/tmdbClient';
import type { TierList } from '../../types/tierList';
import type { PeliculaUsuario } from '../../types/peliculaUsuario';
import { todasLasPeliculasTierList } from '../../types/tierList';
import { CardSurface } from '../../theme/colors';

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
          <Text style={styles.coverEmptyText}>Sin películas</Text>
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
                <Image source={{ uri: posterUrl(p.rutaPoster, 'w200')! }} style={styles.coverImg} />
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
    <Pressable style={styles.container} onPress={onPress}>
      {renderCover()}
      <Text style={[styles.title, { fontFamily }]} numberOfLines={2}>
        {tier.nombre}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '47%',
    borderRadius: 16,
    backgroundColor: '#1E1E2D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 12,
    marginBottom: 8,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: CardSurface,
  },
  coverGrid: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: CardSurface,
  },
  coverCell: { width: '50%', height: '50%' },
  coverImg: { width: '100%', height: '100%' },
  posterFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: CardSurface },
  coverEmptyText: { color: '#888', fontSize: 12 },
  title: { marginTop: 10, color: '#fff', fontSize: 15, paddingHorizontal: 10, textAlign: 'center' },
});
