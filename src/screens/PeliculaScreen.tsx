import React, { useState } from 'react';
import { Image, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { posterUrl } from '../services/tmdbClient';
import { cargarPlataformas } from '../storage/preferences';
import { useCallback } from 'react';

import { useAuth } from '../context/AuthContext';
import { useMontserrat } from '../theme/useMontserrat';
import type { RootStackParamList } from '../navigation/types';
import { GradientBottom } from '../theme/colors';

// Custom Hooks
import { useMovieData } from '../hooks/movie/useMovieData';
import { useUserMovieStatus } from '../hooks/movie/useUserMovieStatus';
import { shareMovie } from '../utils/shareUtils';

// Modular Components
import { MovieHeader } from '../components/movie/MovieHeader';
import { MovieActions } from '../components/movie/MovieActions';
import { MovieRatingButton } from '../components/movie/MovieRatingButton';
import { MovieCast } from '../components/movie/MovieCast';
import { MovieProviders } from '../components/movie/MovieProviders';
import { CollectionSaga } from '../components/movie/CollectionSaga';
import { MovieRatingModal } from '../components/movie/MovieRatingModal';

export function PeliculaScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Pelicula'>>();
  const { movieId } = route.params;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { fontFamily: ff } = useMontserrat();
  const fontFamily = ff || 'System';

  // Logic Hooks
  const { cargando, error: tmdbError, detalles, reparto, providers, coleccion } = useMovieData(movieId);
  const { 
    peliculaBib, bibCargando, accionBib, userError, 
    onPorVer, onToggleVista, onActualizarValoracion 
  } = useUserMovieStatus(movieId, detalles, providers);

  const [descExp, setDescExp] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [misPlataformas, setMisPlataformas] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const plots = await cargarPlataformas();
        setMisPlataformas(plots.map(Number));
      })();
    }, [])
  );

  const error = tmdbError || userError;

  if (cargando && !detalles) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: GradientBottom }]}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (error && !detalles) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: GradientBottom, padding: 24 }]}>
        <Ionicons name="alert-circle-outline" size={64} color="rgba(255,255,255,0.2)" />
        <Text style={[styles.errTitle, { fontFamily }]}>¡Ups!</Text>
        <Text style={[styles.err, { fontFamily }]}>{error}</Text>
        <Pressable style={styles.errBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontFamily, fontWeight: '700' }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  if (!detalles) return null;

  const estadoPelicula = !peliculaBib ? 0 : peliculaBib.estado === 'por_ver' ? 1 : 2;

  return (
    <View style={[styles.flex, { backgroundColor: GradientBottom }]}>
      {/* Fixed Backdrop Background */}
      {(detalles.backdrop_path || detalles.poster_path) && (
        <View style={styles.fixedBackdrop}>
          <Image
            source={{ uri: posterUrl(detalles.backdrop_path || detalles.poster_path, 'original')! }}
            style={styles.backdropImg}
          />
          <LinearGradient
            colors={[
              'rgba(0,0,0,0)', 
              'rgba(0,0,0,0)', 
              'rgba(30,27,75,0.4)', 
              GradientBottom,
              GradientBottom
            ]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      )}
      {/* Navigation Bars */}
      <View style={[styles.navHeader, { top: Math.max(insets.top, 12) + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
          <BlurView intensity={50} tint="dark" style={styles.blurBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </BlurView>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => shareMovie(movieId, detalles?.title || 'Película')} hitSlop={12} style={styles.iconBtn}>
            <BlurView intensity={50} tint="dark" style={styles.blurBtn}>
              <Ionicons name="share-social-outline" size={22} color="#fff" />
            </BlurView>
          </Pressable>

          <Pressable onPress={() => navigation.popToTop()} hitSlop={12} style={styles.iconBtn}>
            <BlurView intensity={50} tint="dark" style={styles.blurBtn}>
              <Ionicons name="home-outline" size={22} color="#fff" />
            </BlurView>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <MovieHeader 
          detalles={detalles} 
          fontFamily={fontFamily} 
          misPlataformas={misPlataformas} 
          providers={providers}
        />
        
        <View style={styles.body}>
          <MovieActions 
            user={user}
            estadoPelicula={estadoPelicula}
            accionBib={accionBib}
            bibCargando={bibCargando}
            onPorVer={onPorVer}
            onVista={() => (estadoPelicula === 2 ? onToggleVista(0) : setShowRatingModal(true))}
            fontFamily={fontFamily}
          />

          <MovieRatingButton 
            peliculaUsuario={peliculaBib}
            onPress={() => setShowRatingModal(true)}
            fontFamily={fontFamily}
          />

          <Text style={[styles.sectionTitle, { fontFamily }]}>Sinopsis</Text>
          <Text
            style={[styles.overview, { fontFamily }]}
            numberOfLines={descExp ? undefined : 3}
          >
            {detalles.overview || 'Sinopsis no disponible.'}
          </Text>
          {detalles.overview && detalles.overview.length > 150 && (
            <Pressable 
              onPress={() => setDescExp(!descExp)} 
              style={{ marginTop: -16, marginBottom: 24, alignSelf: 'flex-start' }}
            >
              <Text style={{ color: '#38bdf8', fontWeight: '700', fontFamily }}>
                {descExp ? 'Ver menos' : '... Ver más'}
              </Text>
            </Pressable>
          )}

          <CollectionSaga 
            coleccion={coleccion} 
            fontFamily={fontFamily} 
            onMovieClick={(id) => navigation.push('Pelicula', { movieId: id })} 
          />

          <MovieCast 
            reparto={reparto} 
            fontFamily={fontFamily} 
            onActorClick={(id, name) => navigation.navigate('Actor', { actorId: id, actorName: name })} 
          />

          <MovieProviders providers={providers} fontFamily={fontFamily} />
        </View>
      </ScrollView>

      <MovieRatingModal 
        visible={showRatingModal}
        titulo={detalles.title}
        valorInicial={peliculaBib?.valoracion ?? 0}
        fontFamily={fontFamily}
        onClose={() => setShowRatingModal(false)}
        onNoValorar={() => {
          setShowRatingModal(false);
          void onToggleVista(0);
        }}
        onGuardar={(v) => {
          setShowRatingModal(false);
          void onToggleVista(v);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  navHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBtn: { width: 44, height: 44 },
  blurBtn: { flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  body: { paddingHorizontal: 20 },
  fixedBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backdropImg: { width: '100%', height: 750, resizeMode: 'cover', transform: [{ scale: 1.2 }] },
  sectionTitle: { fontSize: 22, color: 'rgba(255,255,255,0.95)', fontWeight: '700', marginBottom: 12, marginTop: 16 },
  overview: { color: '#cbd5e1', fontSize: 15, lineHeight: 24, marginBottom: 24 },
  errTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 16 },
  err: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8, fontSize: 16 },
  errBtn: { marginTop: 32, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20 },
});
