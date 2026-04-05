import { Ionicons } from '@expo/vector-icons';
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
  BackHandler,
  ScrollView,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { useDescubrir } from '../hooks/useDescubrir';
import { useDiscoverSearch } from '../hooks/useDiscoverSearch';
import { posterUrl, profileUrl } from '../services/tmdbClient';
import { RatingBadge } from '../components/RatingBadge';
import { useLibraryStatus } from '../hooks/useLibraryStatus';
import {
  cargarCarruselesActivos,
  guardarCarruselesActivos,
  cargarPlataformas,
} from '../storage/preferences';
import { COLORS, CardSurface } from '../theme/colors';
import { SHADOWS } from '../theme/theme';

import { CarruselPeliculas } from '../components/discover/CarruselPeliculas';
import { CategoryModal } from '../components/discover/CategoryModal';
import { useLanguage } from '../context/LanguageContext';

export function DiscoverTab({
  fontFamily,
  estaActiva,
  onPeliculaClick,
  onActorClick,
  onPerfilClick,
  userFoto,
  resetToken = 0,
}: {
  fontFamily: string;
  estaActiva: boolean;
  onPeliculaClick: (movieId: number) => void;
  onActorClick: (actorId: number, actorName: string) => void;
  onPerfilClick?: () => void;
  userFoto?: string | null;
  resetToken?: number;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { useAuth: useAuthLocal } = require('../context/AuthContext');
  const { user } = useAuthLocal();

  const mainListRef = useRef<any>(null);
  const searchInputRef = useRef<TextInput>(null);
  const libraryMap = useLibraryStatus(); // 🛡️ Cerebro de biblioteca

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
  } = useDescubrir(carruselesActivos);

  const {
    textoBuscar,
    setTextoBuscar,
    resultadosBusqueda,
    buscando,
    tipoBusqueda,
    setTipoBusqueda,
  } = useDiscoverSearch();

  // Initial load
  useEffect(() => {
    void (async () => {
      const saved = await cargarCarruselesActivos();
      if (saved.length > 0) setCarruselesActivos(saved);
      else setCarruselesActivos(['Tendencias', 'Próximamente', 'Populares']);
    })();
  }, []);

  // Sync platforms
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
        void require('../services/userPreferences').guardarPreferenciaFirestore(user.uid, 'carruseles', next);
      }
    },
    [user],
  );

  const toggleSearch = () => {
    const newState = !buscarAtiva;
    setBuscarAtiva(newState);
    if (newState) setTimeout(() => searchInputRef.current?.focus(), 100);
    else Keyboard.dismiss();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (buscarAtiva || textoBuscar.length >= 2) {
          setTextoBuscar('');
          setBuscarAtiva(false);
          Keyboard.dismiss();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [buscarAtiva, textoBuscar])
  );

  return (
    <View style={styles.flex}>
      {/* 🛡️ Cabecera Unificada (Glaseada y Sólida) */}
      <BlurView intensity={95} tint="dark" style={[styles.headerContainer, { height: insets.top + (buscarAtiva ? 220 : 80) }]} />
      <View style={[styles.headerContainer, { height: insets.top + (buscarAtiva ? 220 : 80), backgroundColor: 'rgba(15, 23, 42, 0.85)' }]}>
        <View style={styles.headerBorder} />
        <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
          <Text style={[styles.titulo, { fontFamily, flex: 1 }]}>Explorar</Text>
          <View style={styles.actionsTopRow}>
            {modoEdicion && (
              <Pressable onPress={() => setMostrarDialogo(true)} style={styles.iconBtn}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </Pressable>
            )}
            <Pressable onPress={() => setModoEdicion(!modoEdicion)} style={styles.iconBtn}>
              <Ionicons name={modoEdicion ? 'checkmark-circle' : 'create-outline'} size={26} color="#fff" />
            </Pressable>
            <Pressable onPress={toggleSearch} style={styles.iconBtn}>
              <Ionicons name="search-outline" size={28} color="#fff" />
            </Pressable>
            <Pressable onPress={() => onPerfilClick?.()} style={styles.perfilBtnMini}>
              <View style={styles.perfilInnerMini}>
                {userFoto ? <Image source={{ uri: userFoto }} style={styles.perfilFotoMini} /> : <Ionicons name="person" size={22} color="#fff" />}
              </View>
            </Pressable>
          </View>
        </View>

        {buscarAtiva && (
          <Animated.View entering={FadeInDown} style={[styles.searchArea, { top: Math.max(insets.top, 12) + 80 }]}>
            <View style={[styles.searchField, SHADOWS.macLight]}>
              <TextInput
                ref={searchInputRef}
                value={textoBuscar}
                onChangeText={setTextoBuscar}
                placeholder={tipoBusqueda === 'movie' ? 'Buscar películas...' : 'Buscar actores...'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={{ flex: 1, color: '#fff', fontFamily }}
              />
              {textoBuscar.length > 0 && (
                <Pressable onPress={() => setTextoBuscar('')} style={styles.clearBtn} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                </Pressable>
              )}
            </View>
            <View style={styles.typeSelector}>
              <Pressable onPress={() => setTipoBusqueda('movie')} style={[styles.typeBtn, tipoBusqueda === 'movie' && styles.typeBtnActive]}>
                <Text style={[styles.typeBtnText, tipoBusqueda === 'movie' && { color: '#000' }]}>Películas</Text>
              </Pressable>
              <Pressable onPress={() => setTipoBusqueda('person')} style={[styles.typeBtn, tipoBusqueda === 'person' && styles.typeBtnActive]}>
                <Text style={[styles.typeBtnText, tipoBusqueda === 'person' && { color: '#000' }]}>Actores</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>

      {/* 📦 Contenido Principal */}
      <View style={styles.content}>
        {modoEdicion ? (
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
                  onPeliculaClick={onPeliculaClick}
                  onEliminar={() => persistCarruseles(carruselesActivos.filter(c => c !== params.item))}
                  misPlataformas={misPlataformas}
                  libraryMap={libraryMap}
                />
              </ScaleDecorator>
            )}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }}
          />
        ) : (
          <FlatList
            ref={mainListRef}
            data={carruselesActivos}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <CarruselPeliculas
                titulo={item}
                peliculas={peliculasPorCarrusel[item] ?? []}
                onPeliculaClick={onPeliculaClick}
                cargarCarrusel={cargarCarrusel}
                misPlataformas={misPlataformas}
                fontFamily={fontFamily}
                modoEdicion={false}
                onEliminar={() => {}}
                drag={() => {}}
                isActive={false}
                libraryMap={libraryMap}
              />
            )}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargarTodosLosCarruseles} tintColor="#fff" progressViewOffset={100} />}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }}
            keyboardDismissMode="on-drag"
          />
        )}
      </View>

      {/* 🔍 Resultados de Búsqueda (Cae justo después de la cabecera) */}
      {(buscarAtiva || textoBuscar.length >= 2) && (
        <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 1200 }]} onPress={() => { setBuscarAtiva(false); Keyboard.dismiss(); }}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>
      )}

      {textoBuscar.length >= 2 && (
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut} 
          style={[styles.busquedaBox, { top: insets.top + 95 }]}
        >
          {buscando ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={resultadosBusqueda}
              keyExtractor={(item) => String(item.id)}
              numColumns={tipoBusqueda === 'movie' ? 3 : 2}
              contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 140 }}
              onScroll={(e) => {
                if (e.nativeEvent.contentOffset.y < -60) {
                  setBuscarAtiva(false);
                  setTextoBuscar('');
                  Keyboard.dismiss();
                }
              }}
              onScrollBeginDrag={() => Keyboard.dismiss()}
              renderItem={({ item }) => (
                <View style={tipoBusqueda === 'movie' ? styles.movieGridItem : styles.actorGridItem}>
                  <Pressable
                    onPress={() => tipoBusqueda === 'movie' ? onPeliculaClick(item.id) : onActorClick(item.id, item.name)}
                    style={[styles.resultCard, SHADOWS.macLight]}
                  >
                    <Image
                      source={{ uri: tipoBusqueda === 'movie' ? posterUrl(item.poster_path, 'w342')! : profileUrl(item.profile_path)! }}
                      style={styles.fullImg}
                    />
                    {tipoBusqueda === 'movie' && (
                       libraryMap[item.id]?.estado === 'vista' ? (
                         <RatingBadge rating={libraryMap[item.id].valoracion} hideText />
                       ) : libraryMap[item.id]?.estado === 'por_ver' ? (
                         <View style={styles.eyeBadge}><Ionicons name="eye" size={14} color="#3498db" /></View>
                       ) : null
                     )}
                    {tipoBusqueda === 'person' && (
                      <Text style={styles.actorName} numberOfLines={1}>{item.name}</Text>
                    )}
                  </Pressable>
                </View>
              )}
            />
          )}
        </Animated.View>
      )}

      <CategoryModal
        visible={mostrarDialogo}
        onClose={() => setMostrarDialogo(false)}
        carruselesActivos={carruselesActivos}
        onToggle={(name) => persistCarruseles(carruselesActivos.includes(name) ? carruselesActivos.filter(c => c !== name) : [...carruselesActivos, name])}
        fontFamily={fontFamily}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#020617' },
  content: { flex: 1, paddingTop: 80 },
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2000 },
  headerRow: { marginHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
  titulo: { color: '#fff', fontSize: 32, fontWeight: '800' },
  actionsTopRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  perfilBtnMini: { marginLeft: 4 },
  perfilInnerMini: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  perfilFotoMini: { width: '100%', height: '100%' },
  
  searchArea: { position: 'absolute', left: 20, right: 20 },
  searchField: { height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 12 },
  clearBtn: { paddingLeft: 8 },
  typeSelector: { flexDirection: 'row', gap: 8 },
  typeBtn: { paddingHorizontal: 16, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  
  glassOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.8)' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  
  busquedaBox: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#020617', zIndex: 1500 },
  movieGridItem: { width: '33.33%', padding: 4 },
  actorGridItem: { width: '50%', padding: 6 },
  resultCard: { width: '100%', aspectRatio: 2/3, borderRadius: 12, overflow: 'hidden', backgroundColor: CardSurface },
  fullImg: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  actorName: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, textAlign: 'center', paddingVertical: 4 },
  eyeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.4)',
  },
});
