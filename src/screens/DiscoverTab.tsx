import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator, Dimensions, FlatList, Image, Pressable, 
  RefreshControl, ScrollView, StyleSheet, Text, TextInput, View
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { CARRUSELES_DISPONIBLES } from '../constants/carruseles';
import { useDescubrir } from '../hooks/useDescubrir';
import { useDiscoverSearch } from '../hooks/useDiscoverSearch';
import { posterUrl } from '../services/tmdbClient';
import { cargarCarruselesActivos, guardarCarruselesActivos, cargarPlataformas } from '../storage/preferences';
import { GradientBottom, CardSurface, GradientTop } from '../theme/colors';
import { SHADOWS } from '../theme/theme';

// Modular Components
import { PosterItem } from '../components/discover/PosterItem';
import { CarruselPeliculas } from '../components/discover/CarruselPeliculas';
import { CategoryModal } from '../components/discover/CategoryModal';

type Props = {
  fontFamily: string;
  estaActiva: boolean;
  onPeliculaClick: (movieId: number) => void;
  onActorClick: (actorId: number, actorName: string) => void;
  onPerfilClick?: () => void;
  userFoto?: string | null;
};

import { useLanguage } from '../context/LanguageContext';

export function DiscoverTab({ fontFamily, estaActiva, onPeliculaClick, onActorClick, onPerfilClick, userFoto }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [carruselesActivos, setCarruselesActivos] = useState<string[]>([]);
  const [buscarAtiva, setBuscarAtiva] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [misPlataformas, setMisPlataformas] = useState<number[]>([]);

  const { peliculasPorCarrusel, cargando, cargarCarrusel, recargarTodosLosCarruseles, limpiarCarrusel } = useDescubrir();
  const { 
    textoBuscar, 
    setTextoBuscar, 
    resultadosBusqueda, 
    buscando, 
    tipoBusqueda, 
    setTipoBusqueda 
  } = useDiscoverSearch();

  const { profileUrl } = require('../services/tmdbClient');

  useEffect(() => {
    void (async () => {
      const saved = await cargarCarruselesActivos();
      if (saved.length > 0) setCarruselesActivos(saved);
      else setCarruselesActivos(['Tendencias', 'Próximamente', 'Populares']);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const plots = await cargarPlataformas();
        setMisPlataformas(plots.map(Number));
      })();
    }, [])
  );

  const { user } = require('../context/AuthContext').useAuth();

  const persistCarruseles = useCallback((next: string[]) => {
    setCarruselesActivos(next);
    void guardarCarruselesActivos(next);
    if (user) {
      void require('../services/userPreferences').guardarPreferenciaFirestore(user.uid, 'carruseles', next);
    }
  }, [user]);

  const onRefresh = () => recargarTodosLosCarruseles(carruselesActivos);

  return (
    <View style={styles.flex}>
      <LinearGradient colors={[GradientTop, 'transparent']} style={styles.topFade} pointerEvents="none" />
      
      <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
        <Text style={[styles.titulo, { fontFamily, flex: 1 }]} numberOfLines={1}>{t('discover')}</Text>
        <View style={styles.actionsTopRow}>
          <Pressable onPress={() => setModoEdicion(!modoEdicion)} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name={modoEdicion ? "checkmark-circle" : "create-outline"} size={26} color="#fff" />
          </Pressable>
          {!modoEdicion ? (
            <Pressable onPress={() => setBuscarAtiva(!buscarAtiva)} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="search-outline" size={28} color="#fff" />
            </Pressable>
          ) : (
            <Pressable onPress={() => setMostrarDialogo(true)} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={28} color="#fff" />
            </Pressable>
          )}

          <Pressable onPress={() => onPerfilClick?.()} style={styles.perfilBtnMini} hitSlop={8}>
            <BlurView intensity={30} tint="dark" style={styles.perfilInnerMini}>
              {userFoto ? (
                <Image source={{ uri: userFoto }} style={styles.perfilFotoMini} />
              ) : (
                <Ionicons name="person" size={20} color="#fff" />
              )}
            </BlurView>
          </Pressable>
        </View>
      </View>

      {buscarAtiva && (
        <Animated.View entering={FadeInDown} style={{ marginTop: Math.max(insets.top, 12) + 90 }}>
          <View style={styles.searchContainer}>
            <TextInput
              value={textoBuscar}
              onChangeText={setTextoBuscar}
              placeholder={tipoBusqueda === 'movie' ? "Buscar películas..." : "Buscar actores..."}
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.searchField, SHADOWS.macLight, { fontFamily }]}
            />
            <View style={styles.typeSelector}>
              <Pressable 
                onPress={() => setTipoBusqueda('movie')}
                style={[styles.typeBtn, tipoBusqueda === 'movie' && styles.typeBtnActive]}
              >
                <Text style={[styles.typeBtnText, { fontFamily }, tipoBusqueda === 'movie' && styles.typeBtnTextActive]}>Películas</Text>
              </Pressable>
              <Pressable 
                onPress={() => setTipoBusqueda('person')}
                style={[styles.typeBtn, tipoBusqueda === 'person' && styles.typeBtnActive]}
              >
                <Text style={[styles.typeBtnText, { fontFamily }, tipoBusqueda === 'person' && styles.typeBtnTextActive]}>Actores</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}

      {textoBuscar.length >= 3 && buscarAtiva ? (
        <View style={styles.busquedaBox}>
          {buscando ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              key={tipoBusqueda}
              data={resultadosBusqueda}
              keyExtractor={(item) => String(item.id)}
              numColumns={tipoBusqueda === 'movie' ? 3 : 2}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
              renderItem={({ item }) => (
                tipoBusqueda === 'movie' ? (
                  <View style={styles.busquedaPosterGrid}>
                    <PosterItem 
                      item={item} 
                      onPeliculaClick={onPeliculaClick} 
                      misPlataformas={misPlataformas} 
                    />
                  </View>
                ) : (
                  <Pressable 
                    onPress={() => onActorClick(item.id, item.name)}
                    style={styles.actorCard}
                  >
                    <View style={styles.actorImgWrapper}>
                      {item.profile_path ? (
                        <Image source={{ uri: profileUrl(item.profile_path) }} style={styles.actorImg} />
                      ) : (
                        <View style={styles.actorFallback}>
                          <Ionicons name="person" size={30} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.actorTitle, { fontFamily }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.actorSub, { fontFamily }]} numberOfLines={1}>
                      {item.known_for_department === 'Acting' ? 'Actor' : item.known_for_department}
                    </Text>
                  </Pressable>
                )
              )}
            />
          )}
        </View>
      ) : modoEdicion ? (
        <DraggableFlatList
          data={carruselesActivos}
          keyExtractor={(item) => item}
          onDragEnd={({ data }) => persistCarruseles(data)}
          renderItem={(params) => (
            <ScaleDecorator>
              <CarruselPeliculas
                titulo={params.item}
                drag={params.drag}
                isActive={params.isActive}
                modoEdicion={true}
                fontFamily={fontFamily}
                peliculas={peliculasPorCarrusel[params.item] ?? []}
                cargarCarrusel={cargarCarrusel}
                onEliminar={() => {
                  limpiarCarrusel(params.item);
                  persistCarruseles(carruselesActivos.filter((c) => c !== params.item));
                }}
                onPeliculaClick={onPeliculaClick}
                misPlataformas={misPlataformas}
              />
            </ScaleDecorator>
          )}
          contentContainerStyle={{ paddingTop: 160, paddingBottom: 140 }}
          activationDistance={20}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={onRefresh} tintColor="#fff" progressViewOffset={100} />}
        />
      ) : (
        <FlatList
          data={carruselesActivos}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CarruselPeliculas
              titulo={item}
              modoEdicion={false}
              fontFamily={fontFamily}
              peliculas={peliculasPorCarrusel[item] ?? []}
              cargarCarrusel={cargarCarrusel}
              onEliminar={() => {}}
              onPeliculaClick={onPeliculaClick}
              drag={() => {}}
              isActive={false}
              misPlataformas={misPlataformas}
            />
          )}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={onRefresh} tintColor="#fff" progressViewOffset={100} />}
          contentContainerStyle={{ paddingTop: 160, paddingBottom: 140 }}
          scrollEnabled={estaActiva}
          removeClippedSubviews={true}
          initialNumToRender={5}
        />
      )}

      <CategoryModal 
        visible={mostrarDialogo} 
        onClose={() => setMostrarDialogo(false)} 
        carruselesActivos={carruselesActivos} 
        onToggle={(nombre) => {
          if (carruselesActivos.includes(nombre)) {
            limpiarCarrusel(nombre);
            persistCarruseles(carruselesActivos.filter(c => c !== nombre));
          } else {
            persistCarruseles([...carruselesActivos, nombre]);
          }
        }}
        fontFamily={fontFamily}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titulo: { color: '#fff', fontSize: 34, fontWeight: '800' },
  headerRow: { 
    position: 'absolute', 
    left: 24, 
    right: 24, 
    zIndex: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  actionsTopRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  perfilBtnMini: { marginLeft: 4 },
  perfilInnerMini: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.4)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  perfilFotoMini: { width: '100%', height: '100%' },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 5 },
  searchContainer: { marginHorizontal: 20 },
  searchField: { 
    borderRadius: 24, 
    backgroundColor: CardSurface, 
    paddingHorizontal: 20, 
    height: 52, 
    color: '#fff',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12
  },
  typeSelector: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  typeBtnActive: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  typeBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  typeBtnTextActive: { color: '#fff' },
  busquedaBox: { flex: 1, marginTop: 12 },
  busquedaPosterGrid: { width: (Dimensions.get('window').width - 60) / 3, height: 160, margin: 6, borderRadius: 12, overflow: 'hidden' },
  actorCard: { flex: 1, margin: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  actorImgWrapper: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  actorImg: { width: '100%', height: '100%' },
  actorFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actorTitle: { color: '#fff', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  actorSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  posterFallback: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  fallbackText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, textAlign: 'center', marginTop: 4 },
});
