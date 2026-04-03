import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { useDescubrir } from '../hooks/useDescubrir';
import { useDiscoverSearch } from '../hooks/useDiscoverSearch';
import { posterUrl } from '../services/tmdbClient';
import {
  cargarCarruselesActivos,
  guardarCarruselesActivos,
  cargarPlataformas,
} from '../storage/preferences';
import { COLORS, GRADIENTS, GLASS } from '../theme/colors';
import { SHADOWS } from '../theme/theme';

// Modular Components
import { CarruselPeliculas } from '../components/discover/CarruselPeliculas';
import { CategoryModal } from '../components/discover/CategoryModal';

import { useLanguage } from '../context/LanguageContext';

const { width: windowWidth } = Dimensions.get('window');

type Props = {
  fontFamily: string;
  estaActiva: boolean;
  onPeliculaClick: (movieId: number) => void;
  onActorClick: (actorId: number, actorName: string) => void;
  onPerfilClick?: () => void;
  userFoto?: string | null;
  resetToken?: number;
};

export function DiscoverTab({
  fontFamily,
  estaActiva,
  onPeliculaClick,
  onActorClick,
  onPerfilClick,
  userFoto,
  resetToken = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const mainListRef = useRef<any>(null);
  const searchInputRef = useRef<TextInput>(null);

  const [carruselesActivos, setCarruselesActivos] = useState<string[]>([]);
  const [buscarAtiva, setBuscarAtiva] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [misPlataformas, setMisPlataformas] = useState<number[]>([]);

  const {
    peliculasPorCarrusel,
    cargando,
    cargarCarrusel,
    recargarTodosLosCarruseles,
    limpiarCarrusel,
  } = useDescubrir(carruselesActivos);
  const {
    textoBuscar,
    setTextoBuscar,
    resultadosBusqueda,
    buscando,
    tipoBusqueda,
    setTipoBusqueda,
  } = useDiscoverSearch();

  const { profileUrl } = require('../services/tmdbClient');
  const { useAuth } = require('../context/AuthContext');
  const { user } = useAuth();

  // Reset logic: Scroll to Top
  useEffect(() => {
    if (resetToken > 0) {
      if (buscarAtiva) {
        setBuscarAtiva(false);
        setTextoBuscar('');
      } else {
        mainListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
      }
    }
  }, [resetToken]);

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
    }, []),
  );

  const persistCarruseles = useCallback(
    (next: string[]) => {
      setCarruselesActivos(next);
      void guardarCarruselesActivos(next);
      if (user) {
        void require('../services/userPreferences').guardarPreferenciaFirestore(
          user.uid,
          'carruseles',
          next,
        );
      }
    },
    [user],
  );

  const onRefresh = () => recargarTodosLosCarruseles();

  const toggleSearch = () => {
    const newState = !buscarAtiva;
    setBuscarAtiva(newState);
    if (newState) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setTextoBuscar('');
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={[COLORS.background, 'transparent']}
        style={styles.topFade}
        pointerEvents="none"
      />

      <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
        <Text style={[styles.titulo, { fontFamily, flex: 1 }]} numberOfLines={1}>
          {t('discover')}
        </Text>
        <View style={styles.actionsTopRow}>
          {modoEdicion && (
            <Pressable
              onPress={() => setMostrarDialogo(true)}
              style={[styles.iconBtn, styles.addBtnGlass]}
              hitSlop={8}
            >
              <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            </Pressable>
          )}
          <Pressable
            onPress={() => setModoEdicion(!modoEdicion)}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Ionicons
              name={modoEdicion ? 'checkmark-circle' : 'create-outline'}
              size={26}
              color="#fff"
            />
          </Pressable>
          <Pressable onPress={toggleSearch} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="search-outline" size={28} color="#fff" />
          </Pressable>
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
        <Animated.View
          entering={FadeInDown}
          style={[styles.searchOverlay, { top: Math.max(insets.top, 12) + 80 }]}
        >
          <BlurView intensity={96} tint="dark" style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={['rgba(2, 6, 23, 0.4)', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
          </BlurView>
          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              value={textoBuscar}
              onChangeText={setTextoBuscar}
              placeholder={tipoBusqueda === 'movie' ? 'Buscar películas...' : 'Buscar actores...'}
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.searchField, SHADOWS.macLight, { fontFamily }]}
            />
            <View style={styles.typeSelector}>
              <Pressable
                onPress={() => setTipoBusqueda('movie')}
                style={[styles.typeBtn, tipoBusqueda === 'movie' && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    { fontFamily },
                    tipoBusqueda === 'movie' && { color: COLORS.background },
                  ]}
                >
                  Películas
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTipoBusqueda('person')}
                style={[styles.typeBtn, tipoBusqueda === 'person' && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    { fontFamily },
                    tipoBusqueda === 'person' && { color: COLORS.background },
                  ]}
                >
                  Actores
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}

      {textoBuscar.length >= 2 && buscarAtiva ? (
        <View style={[styles.busquedaBox, { marginTop: Math.max(insets.top, 12) + 210 }]}>
          {buscando ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              key={tipoBusqueda}
              data={resultadosBusqueda}
              keyExtractor={(item) => String(item.id)}
              numColumns={tipoBusqueda === 'movie' ? 3 : 2}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
              renderItem={({ item }) =>
                tipoBusqueda === 'movie' ? (
                  <View style={styles.busquedaPosterGrid}>
                    <Pressable
                      onPress={() => onPeliculaClick(item.id)}
                      style={styles.searchPosterCard}
                    >
                      {item.poster_path ? (
                        <Image
                          source={{ uri: posterUrl(item.poster_path, 'w342')! }}
                          style={styles.fullPoster}
                        />
                      ) : (
                        <View style={styles.posterFallback}>
                          <Text style={styles.fallbackText}>{item.title}</Text>
                        </View>
                      )}
                      {item.vote_average > 0 && (
                        <View style={styles.searchBadge}>
                          <Text style={styles.searchBadgeText}>{item.vote_average.toFixed(1)}</Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => onActorClick(item.id, item.name)}
                    style={styles.actorCard}
                  >
                    <View style={styles.actorImgWrapper}>
                      {item.profile_path ? (
                        <Image
                          source={{ uri: profileUrl(item.profile_path) }}
                          style={styles.actorImg}
                        />
                      ) : (
                        <View style={styles.actorFallback}>
                          <Ionicons name="person" size={30} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.actorTitle, { fontFamily }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </Pressable>
                )
              }
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
                modoEdicion
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
        />
      ) : (
        <FlatList
          ref={mainListRef}
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
          refreshControl={
            <RefreshControl
              refreshing={cargando}
              onRefresh={onRefresh}
              tintColor="#fff"
              progressViewOffset={100}
            />
          }
          contentContainerStyle={{ paddingTop: 160, paddingBottom: 140 }}
          removeClippedSubviews
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
            persistCarruseles(carruselesActivos.filter((c) => c !== nombre));
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
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    overflow: 'hidden',
  },
  perfilFotoMini: { width: '100%', height: '100%' },
  addBtnGlass: {
    marginRight: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: 20,
  },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 5 },
  searchOverlay: { position: 'absolute', left: 0, right: 0, zIndex: 90, paddingBottom: 20 },
  searchContainer: { marginHorizontal: 20 },
  searchField: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    height: 52,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: GLASS.border,
    marginBottom: 12,
  },
  typeSelector: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  typeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: GLASS.white,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  typeBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  busquedaBox: { flex: 1 },
  busquedaPosterGrid: { flex: 1 / 3, margin: 6 },
  searchPosterCard: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: GLASS.white,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  fullPoster: { width: '100%', height: '100%' },
  posterFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  fallbackText: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center' },
  searchBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  searchBadgeText: { color: COLORS.text, fontSize: 10, fontWeight: '800' },
  actorCard: {
    flex: 1 / 2,
    margin: 6,
    backgroundColor: GLASS.white,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  actorImgWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 10,
  },
  actorImg: { width: '100%', height: '100%' },
  actorFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actorTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },
});
