import React from 'react';
import { Image, StyleSheet, Text, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { posterUrl } from '../../services/tmdbClient';
import type { MovieDetails, WatchProvidersResponse } from '../../types/tmdb';
import { SHADOWS } from '../../theme/theme';

type Props = {
  detalles: MovieDetails;
  fontFamily: string;
  misPlataformas?: number[];
  providers: WatchProvidersResponse | null;
};

export const MovieHeader = React.memo(({ detalles, fontFamily, misPlataformas = [], providers }: Props) => {
  const resES = providers?.results?.['ES'];
  const flatrate = resES?.flatrate?.map(p => p.provider_id) || [];
  const rent = [...(resES?.rent || []), ...(resES?.buy || [])].map(p => p.provider_id);

  const isFlatrate = flatrate.some(p => misPlataformas.includes(p));
  const isRent = !isFlatrate && rent.some(p => misPlataformas.includes(p));

  return (
    <View style={styles.container}>
      {/* Title Card Overlay */}
      <View style={styles.content}>
        <View style={[styles.macCardWrap, SHADOWS.mac]}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 10, 20, 0.75)' }]} />

          <View style={styles.macCardInner}>
            <View style={styles.posterShadow}>
              <View style={styles.posterClip}>
                {detalles.poster_path ? (
                  <Image
                    source={{ uri: posterUrl(detalles.poster_path, 'w500')! }}
                    style={styles.mainPoster}
                  />
                ) : (
                  <View style={[styles.mainPoster, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
                )}
                
                {(isFlatrate || isRent) && (
                  <View style={[
                    styles.dot, 
                    { backgroundColor: isFlatrate ? '#2ecc71' : '#f39c12' }
                  ]} />
                )}
              </View>
            </View>

            <View style={styles.infoCol}>
              <Text style={[styles.title, { fontFamily }]} adjustsFontSizeToFit numberOfLines={2}>
                {detalles.title}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { fontFamily }]}>
                  {detalles.release_date?.slice(0, 4) ?? '—'}  •  ⭐ {detalles.vote_average.toFixed(1)}
                </Text>
                {detalles.runtime ? (
                  <View style={styles.badge}>
                    <Text style={[styles.badgeText, { fontFamily }]}>{detalles.runtime} min</Text>
                  </View>
                ) : null}
              </View>
              {detalles.genres.length ? (
                <View style={styles.genreRow}>
                  {detalles.genres.slice(0, 3).map((g) => (
                    <View key={g.id} style={styles.chip}>
                      <Text style={styles.chipText}>{g.name}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { width: '100%', minHeight: 200 },
  content: { paddingHorizontal: 20, paddingTop: 100, zIndex: 10 },
  macCardWrap: {
    borderRadius: 24,
    marginBottom: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  macCardInner: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    alignItems: 'center',
  },
  posterShadow: {
    width: 100,
    height: 150,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    ...SHADOWS.macLight
  },
  posterClip: { width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' },
  mainPoster: { width: '100%', height: '100%' },
  infoCol: { flex: 1 },
  title: { fontSize: 24, color: '#fff', fontWeight: '800', lineHeight: 28, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  metaText: { color: '#ccc', fontSize: 13 },
  badge: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipText: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '600' },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 4
  }
});
