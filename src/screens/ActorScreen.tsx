import React, { useState, useMemo } from 'react';
import { 
  ActivityIndicator, FlatList, Image, Pressable, ScrollView, 
  StyleSheet, Text, View, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActorData } from '../hooks/movie/useActorData';
import { useMontserrat } from '../theme/useMontserrat';
import { GradientBackground } from '../components/GradientBackground';
import { ActorHeader } from '../components/movie/ActorHeader';
import { FilterSortMenu, type FilterSortOption } from '../components/FilterSortMenu';
import { posterUrl } from '../services/tmdbClient';
import { SHADOWS } from '../theme/theme';
import { shareActor } from '../utils/shareUtils';
import type { RootStackParamList } from '../navigation/types';
import { GradientBottom } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 74) / 3;

const GENRE_MAP: Record<number, string> = {
  28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia', 80: 'Crimen',
  99: 'Documental', 18: 'Drama', 10751: 'Familia', 14: 'Fantasía', 36: 'Historia',
  27: 'Terror', 10402: 'Música', 9648: 'Misterio', 10749: 'Romance', 878: 'Ciencia ficción',
  10770: 'Película de TV', 53: 'Suspense', 10752: 'Bélica', 37: 'Western'
};

export function ActorScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Actor'>>();
  const { actorId } = route.params;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { fontFamily: ff } = useMontserrat();
  const fontFamily = ff || 'System';

  const { detalles, peliculas, cargando, error } = useActorData(actorId);

  const [filtroGenero, setFiltroGenero] = useState<number | null>(null);
  const [orden, setOrden] = useState<'popularity' | 'date'>('popularity');
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const generosOpciones = useMemo(() => {
    const set = new Set<number>();
    peliculas.forEach(p => p.genre_ids?.forEach(g => set.add(g)));
    const options: FilterSortOption[] = [{ label: 'Todos los géneros', value: 0, icon: 'apps-outline' }];
    Array.from(set).forEach(gid => {
      if (GENRE_MAP[gid]) options.push({ label: GENRE_MAP[gid], value: gid, icon: 'film-outline' });
    });
    return options;
  }, [peliculas]);

  const pelisFiltradas = useMemo(() => {
    let base = [...peliculas];
    if (orden === 'date') base.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
    else base.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    if (!filtroGenero || filtroGenero === 0) return base;
    return base.filter(p => p.genre_ids?.includes(filtroGenero));
  }, [peliculas, filtroGenero, orden]);

  if (cargando) {
    return (
      <GradientBackground style={styles.center}>
        <ActivityIndicator color="#fff" size="large" />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.navBtn, { left: 20, top: Math.max(insets.top, 12) }]}>
            <BlurView intensity={30} tint="dark" style={styles.btnInner}><Ionicons name="chevron-back" size={24} color="#fff" /></BlurView>
          </Pressable>
          <Pressable onPress={() => navigation.popToTop()} style={[styles.navBtn, { right: 20, top: Math.max(insets.top, 12) }]}>
            <BlurView intensity={30} tint="dark" style={styles.btnInner}><Ionicons name="home-outline" size={20} color="#fff" /></BlurView>
          </Pressable>
          <Pressable onPress={() => shareActor(actorId, detalles?.name || 'Actor')} style={[styles.navBtn, { right: 70, top: Math.max(insets.top, 12) }]}>
            <BlurView intensity={30} tint="dark" style={styles.btnInner}><Ionicons name="share-social-outline" size={20} color="#fff" /></BlurView>
          </Pressable>
          <Pressable onPress={() => setMostrarMenu(true)} style={[styles.navBtn, { right: 20, top: Math.max(insets.top, 12) + 50 }]}>
            <BlurView intensity={30} tint="dark" style={styles.btnInner}><Ionicons name="options-outline" size={20} color="#fff" /></BlurView>
          </Pressable>

          <ActorHeader 
            foto={detalles?.profile_path ?? undefined} 
            nombre={detalles?.name ?? ''} 
            lugarNacimiento={detalles?.place_of_birth ?? undefined} 
            fontFamily={fontFamily} 
          />
        </View>

        {detalles?.biography && (
          <View style={styles.bioBox}>
            <BlurView intensity={15} tint="dark" style={styles.glassCard}>
              <Text style={[styles.secTitle, { fontFamily }]}>Biografía</Text>
              <Text style={[styles.bioText, { fontFamily }]} numberOfLines={6}>{detalles.biography}</Text>
            </BlurView>
          </View>
        )}

        <View style={styles.filmography}>
          <Text style={[styles.secTitle, { fontFamily, marginLeft: 25, marginBottom: 15 }]}>Películas destacadas</Text>
          <FlatList
            data={pelisFiltradas}
            keyExtractor={(item) => String(item.id)}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            renderItem={({ item: p }) => (
              <Pressable style={[styles.card, SHADOWS.macLight]} onPress={() => navigation.push('Pelicula', { movieId: p.id })}>
                {p.poster_path ? <Image source={{ uri: posterUrl(p.poster_path)! }} style={styles.poster} /> : (
                  <View style={styles.noPoster}><Text style={[styles.noPosterText, { fontFamily }]}>{p.title}</Text></View>
                )}
              </Pressable>
            )}
            columnWrapperStyle={styles.row}
          />
        </View>
      </ScrollView>

      <FilterSortMenu
        visible={mostrarMenu}
        onClose={() => setMostrarMenu(false)}
        title="Ordenar por"
        options={[
          { label: 'Popularidad', value: 'popularity', icon: 'trending-up-outline', description: 'Películas más exitosas.' },
          { label: 'Fecha de estreno', value: 'date', icon: 'calendar-outline', description: 'Más recientes primero.' },
        ]}
        currentValue={orden}
        onSelect={setOrden}
        filterTitle="Filtrar por género"
        filters={generosOpciones}
        currentFilter={filtroGenero || 0}
        onSelectFilter={(v) => setFiltroGenero(v === 0 ? null : v)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 40, alignItems: 'center', marginBottom: 20 },
  navBtn: { position: 'absolute', zIndex: 10 },
  btnInner: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)' },
  bioBox: { paddingHorizontal: 20, marginBottom: 30 },
  glassCard: { borderRadius: 24, padding: 20, backgroundColor: 'rgba(30, 41, 59, 0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  secTitle: { fontSize: 18, color: 'rgba(255,255,255,0.95)', fontWeight: '700', marginBottom: 10 },
  bioText: { fontSize: 14, color: '#cbd5e1', lineHeight: 20 },
  filmography: { flex: 1 },
  list: { paddingHorizontal: 25 },
  row: { gap: 12, marginBottom: 12 },
  card: { width: CARD_WIDTH, height: 160, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  poster: { width: '100%', height: '100%' },
  noPoster: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 8 },
  noPosterText: { color: '#fff', fontSize: 10, textAlign: 'center' },
});
