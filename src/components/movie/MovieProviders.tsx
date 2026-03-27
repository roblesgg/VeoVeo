import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { posterUrl } from '../../services/tmdbClient';
import type { WatchProvidersResponse } from '../../types/tmdb';

type Props = {
  providers: WatchProvidersResponse | null;
  fontFamily: string;
};

export const MovieProviders = React.memo(({ providers, fontFamily }: Props) => {
  const es = providers?.results?.ES;
  if (!es) return null;

  const hasContent = es.flatrate || es.rent || es.buy;
  if (!hasContent) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.section, { fontFamily }]}>Dónde ver</Text>
      <View style={styles.providersBox}>
        <BlurView intensity={20} tint="dark" style={styles.providersInner}>
          {es.flatrate && (
            <View style={styles.providerRow}>
              <Text style={[styles.providerType, { fontFamily }]}>Suscripción</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providerIcons}>
                {es.flatrate.map(p => (
                  <Image key={p.provider_id} source={{ uri: posterUrl(p.logo_path)! }} style={styles.providerIcon} />
                ))}
              </ScrollView>
            </View>
          )}
          
          {es.rent && (
            <View style={styles.providerRow}>
              <Text style={[styles.providerType, { fontFamily }]}>Alquilar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providerIcons}>
                {es.rent.map(p => (
                  <Image key={p.provider_id} source={{ uri: posterUrl(p.logo_path)! }} style={styles.providerIcon} />
                ))}
              </ScrollView>
            </View>
          )}

          {!es.flatrate && !es.rent && (
            <Text style={[styles.noProviders, { fontFamily }]}>No disponible para streaming en España.</Text>
          )}
        </BlurView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: 32 },
  section: { fontSize: 22, color: '#fff', fontWeight: '700', marginBottom: 12 },
  providersBox: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  providersInner: { padding: 16 },
  providerRow: { marginBottom: 16 },
  providerType: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  providerIcons: { flexDirection: 'row' },
  providerIcon: { width: 44, height: 44, borderRadius: 10, marginRight: 10 },
  noProviders: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontStyle: 'italic' },
});
