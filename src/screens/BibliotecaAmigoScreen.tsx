import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listarPeliculasPorEstadoDeUsuario } from '../services/repositorioPeliculasUsuario';
import { obtenerPerfilUsuarioPorUid } from '../services/repositorioUsuarios';
import { posterUrl } from '../services/tmdbClient';
import type { PeliculaUsuario } from '../types/peliculaUsuario';
import type { UsuarioPerfil } from '../types/usuario';
import { AccentBorder, CardSurface, GlassBorder, GlassSurface, GlassWhite, GradientBottom } from '../theme/colors';
import { SHADOWS } from '../theme/theme';
import { useMontserrat } from '../theme/useMontserrat';
import { GradientBackground } from '../components/GradientBackground';
import { FilterSortMenu } from '../components/FilterSortMenu';
import { RatingBadge } from '../components/RatingBadge';

type Props = {
  amigoUid: string;
  onVolverClick: () => void;
  onPeliculaClick: (movieId: number) => void;
};

const Container = Platform.OS === 'ios' ? BlurView : View;

export function BibliotecaAmigoScreen({ amigoUid, onVolverClick, onPeliculaClick }: Props) {
  const insets = useSafeAreaInsets();
  const { fontFamily, loaded: fontLoaded } = useMontserrat();
  const ff = fontFamily || 'System';

  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [seccion, setSeccion] = useState<0 | 1>(0);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [porVer, setPorVer] = useState<PeliculaUsuario[]>([]);
  const [vistas, setVistas] = useState<PeliculaUsuario[]>([]);
  const [orden, setOrden] = useState<'recientes' | 'alpha' | 'fecha_peli' | 'valoracion'>('recientes');
  const [mostrarMenu, setMostrarMenu] = useState(false);

  useEffect(() => {
    void (async () => {
      setCargando(true);
      try {
        const [u, pv, vi] = await Promise.all([
          obtenerPerfilUsuarioPorUid(amigoUid),
          listarPeliculasPorEstadoDeUsuario(amigoUid, 'por_ver'),
          listarPeliculasPorEstadoDeUsuario(amigoUid, 'vista'),
        ]);
        setUsuario(u);
        setPorVer(pv);
        setVistas(vi);
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    })();
  }, [amigoUid]);

  const listBase = useMemo(() => {
    let base = [...(seccion === 0 ? porVer : vistas)];
    if (orden === 'alpha') {
      base.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (orden === 'fecha_peli') {
      base.sort((a, b) => (b.fechaLanzamiento || '').localeCompare(a.fechaLanzamiento || ''));
    } else if (orden === 'valoracion') {
      base.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
    } else {
      // Recientes
      base.sort((a, b) => (b.fechaAnadido || 0) - (a.fechaAnadido || 0));
    }
    return base;
  }, [seccion, porVer, vistas, orden]);

  const filtrada = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return listBase;
    return listBase.filter((p) => p.titulo.toLowerCase().includes(q));
  }, [listBase, buscar]);

  const resenasCount = vistas.filter(p => p.valoracion && p.valoracion !== 0).length;

  if (cargando) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: '#1A1A2E' }]}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <GradientBackground style={styles.flex}>
      <Pressable
        onPress={onVolverClick}
        style={[styles.backBtn, { top: Math.max(insets.top, 12) + 8 }]}
        hitSlop={12}
      >
        <BlurView intensity={50} tint="dark" style={styles.backBtnInner}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </BlurView>
      </Pressable>

      <Pressable
        onPress={() => setMostrarMenu(true)}
        style={[styles.sortBtn, { top: Math.max(insets.top, 12) + 8 }]}
        hitSlop={12}
      >
        <BlurView intensity={50} tint="dark" style={styles.backBtnInner}>
          <Ionicons name="options-outline" size={24} color="#fff" />
        </BlurView>
      </Pressable>

      <FilterSortMenu
        visible={mostrarMenu}
        onClose={() => setMostrarMenu(false)}
        title="Ordenar Biblioteca"
        options={[
          { label: 'Recientes', value: 'recientes', icon: 'time-outline', description: 'Películas añadidas últimamente.' },
          { label: 'Título (A-Z)', value: 'alpha', icon: 'text-outline', description: 'Orden alfabético por nombre.' },
          { label: 'Lanzamiento', value: 'fecha_peli', icon: 'calendar-outline', description: 'Por año de estreno en cines.' },
          { label: 'Valoración', value: 'valoracion', icon: 'star-outline', description: 'Favoritas de tu amigo arriba.' },
        ]}
        currentValue={orden}
        onSelect={setOrden}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 12) + 44, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Perfil */}
        <View style={[styles.avatarWrap, SHADOWS.mac]}>
          {usuario?.fotoPerfil ? (
            <Image source={{ uri: usuario.fotoPerfil }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color="rgba(255,255,255,0.85)" />
            </View>
          )}
        </View>

        <Text style={[styles.usernameText, { fontFamily: ff }]}>{usuario?.username || 'Usuario'}</Text>

        <View style={styles.statsRow}>
          <EstadisticaItem num={String(vistas.length)} label={'Películas\nVistas'} ff={ff} />
          <EstadisticaItem num={String(porVer.length)} label={'Por\nVer'} ff={ff} />
          <EstadisticaItem num={String(resenasCount)} label="Reseñas" ff={ff} />
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
          <TextInput
            value={buscar}
            onChangeText={setBuscar}
            placeholder="Buscar película..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={[styles.searchField, { fontFamily: ff }]}
          />
        </View>

        {/* Tabs Biblioteca */}
        <View style={styles.tabContainer}>
          <Container intensity={15} tint="dark" style={styles.tabRow}>
            <Pressable onPress={() => setSeccion(0)} style={[styles.tabBtn, seccion === 0 && styles.tabOnBtn]}>
              <Text style={[styles.tabText, seccion === 0 && styles.tabOnText, { fontFamily: ff }]}>Por Ver</Text>
            </Pressable>
            <Pressable onPress={() => setSeccion(1)} style={[styles.tabBtn, seccion === 1 && styles.tabOnBtn]}>
              <Text style={[styles.tabText, seccion === 1 && styles.tabOnText, { fontFamily: ff }]}>Vistas</Text>
            </Pressable>
          </Container>
        </View>

        {/* Grid Películas */}
        {filtrada.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={64} color="rgba(255,255,255,0.1)" />
            <Text style={[styles.empty, { fontFamily: ff }]}>Sin películas en esta sección.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtrada.map((p) => (
              <Pressable
                key={p.idPelicula}
                style={[styles.card, SHADOWS.macLight]}
                onPress={() => onPeliculaClick(p.idPelicula)}
              >
                {p.rutaPoster ? (
                  <Image source={{ uri: posterUrl(p.rutaPoster, 'w200')! }} style={styles.poster} />
                ) : (
                  <View style={[styles.poster, styles.fallback]}>
                    <Text style={[styles.fallbackText, { fontFamily: ff }]} numberOfLines={3}>
                      {p.titulo}
                    </Text>
                  </View>
                )}

                <RatingBadge rating={p.valoracion} fontFamily={fontFamily} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

function EstadisticaItem({ num, label, ff }: { num: string; label: string; ff: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statNum}>{num}</Text>
      <Text style={[styles.statLabel, { fontFamily: ff }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center' },
  backBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  sortBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  backBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  avatarWrap: {
    marginBottom: 16,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  statItem: { alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  searchContainer: {
    width: '100%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GlassSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchField: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  tabContainer: {
    width: '100%',
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabOnBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  tabOnText: { color: '#fff' },
  noPelisText: { color: 'rgba(255,255,255,0.4)', marginTop: 10, fontSize: 16 },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 16,
    opacity: 0.5,
  },
  empty: { color: '#fff', textAlign: 'center', fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  card: {
    width: '31%',
    aspectRatio: 0.67,
    borderRadius: 14,
    backgroundColor: CardSurface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  poster: { width: '100%', height: '100%' },
  fallback: { alignItems: 'center', justifyContent: 'center', padding: 6 },
  fallbackText: { color: '#fff', fontSize: 10, textAlign: 'center' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  overlayPoop: { backgroundColor: 'rgba(139,69,19,0.85)' },
});
