import React, { useState, useMemo, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useLibraryData } from '../hooks/movie/useLibraryData';
import { posterUrl, tmdbApi } from '../services/tmdbClient';
import { CardSurface } from '../theme/colors';
import { SHADOWS } from '../theme/theme';
import { FilterSortMenu } from '../components/FilterSortMenu';
import { RatingBadge } from '../components/RatingBadge';
import { LiquidGlassPanel } from '../components/LiquidGlassPanel';
import { useLanguage } from '../context/LanguageContext';
import * as preferences from '../storage/preferences';

const { width: windowWidth } = Dimensions.get('window');
const CARD_WIDTH = (windowWidth - 74) / 3;

type Props = {
  fontFamily: string;
  refreshToken?: number;
  onPeliculaClick: (movieId: number) => void;
  onPerfilClick?: () => void;
  userFoto?: string | null;
  resetToken?: number;
  esAmigo?: boolean;
};

export function BibliotecaTab({
  fontFamily,
  refreshToken = 0,
  onPeliculaClick,
  onPerfilClick,
  userFoto,
  resetToken = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const listRef = React.useRef<FlatList>(null);

  useEffect(() => {
    if (resetToken > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [resetToken]);

  const [seccion, setSeccion] = useState<0 | 1>(0); // 0: Por Ver, 1: Vistas
  const [buscar, setBuscar] = useState(false);
  const [textoBuscar, setTextoBuscar] = useState('');
  const [orden, setOrden] = useState<'recientes' | 'alpha' | 'fecha_peli' | 'valoracion'>(
    'recientes',
  );
  const [showFilters, setShowFilters] = useState(false);
  const [misPlataformas, setMisPlataformas] = useState<number[]>([]);

  const { t } = useLanguage();
  const { porVer, vistas, cargando } = useLibraryData(user, refreshToken);

  useEffect(() => {
    void (async () => {
      const savedOrden = await preferences.cargarOrdenBiblioteca(
        seccion === 0 ? 'por_ver' : 'vistas',
      );
      const plots = await preferences.cargarPlataformas();
      if (savedOrden) setOrden(savedOrden as any);
      setMisPlataformas(plots.map(Number));
    })();
  }, [refreshToken, seccion]);

  const handleSetOrden = async (val: any) => {
    setOrden(val);
    await preferences.guardarOrdenBiblioteca(seccion === 0 ? 'por_ver' : 'vistas', val);
  };

  const rowsData = useMemo(() => {
    const raw = seccion === 0 ? porVer : vistas;
    const base = [...raw];

    if (orden === 'alpha') base.sort((a, b) => a.titulo.localeCompare(b.titulo));
    else if (orden === 'fecha_peli')
      base.sort((a, b) => (b.fechaLanzamiento || '').localeCompare(a.fechaLanzamiento || ''));
    else if (orden === 'valoracion') base.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
    else {
      if (seccion === 1)
        base.sort((a, b) => (b.fechaVisto || b.fechaAnadido) - (a.fechaVisto || a.fechaAnadido));
      else base.sort((a, b) => b.fechaAnadido - a.fechaAnadido);
    }

    const qBase = textoBuscar.trim().toLowerCase();
    const filtered = qBase ? base.filter((p: any) => p.titulo.toLowerCase().includes(qBase)) : base;

    const result: any[] = [];
    let currentRow: any[] = [];
    let lastMonthHeader: string | null = null;
    const now = new Date();
    const currentMonthYear = `${now.getMonth()}-${now.getFullYear()}`;

    filtered.forEach((p: any) => {
      if (seccion === 1 && orden === 'recientes') {
        const date = new Date(p.fechaVisto || p.fechaAnadido);
        const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
        const monthName = date.toLocaleString('default', { month: 'long' });
        const yearName = date.getFullYear();
        const header = `${monthName} ${yearName}`;

        if (header !== lastMonthHeader) {
          if (currentRow.length > 0) {
            result.push({ isRow: true, items: currentRow });
            currentRow = [];
          }
          result.push({
            isHeader: true,
            title: monthYear === currentMonthYear ? 'Vistas este mes' : header,
          });
          lastMonthHeader = header;
        }
      }

      currentRow.push(p);
      if (currentRow.length === 3) {
        result.push({ isRow: true, items: currentRow });
        currentRow = [];
      }
    });

    if (currentRow.length > 0) {
      result.push({ isRow: true, items: currentRow });
    }

    return result;
  }, [porVer, vistas, seccion, textoBuscar, orden]);

  return (
    <View style={styles.flex}>
      <LiquidGlassPanel
        style={[
          styles.tabsHeaderOverlay,
          { height: Math.max(insets.top, 12) + 130 + (buscar ? 60 : 0) },
        ]}
        rounded={false}
        intensity={100}
      >
        <LinearGradient
          colors={['rgba(2, 6, 23, 0.1)', 'rgba(2, 6, 23, 0.45)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderBottomWidth: 1,
              borderColor: 'rgba(255,255,255,0.18)',
            },
          ]}
        />
      </LiquidGlassPanel>

      <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
        <Text style={[styles.titulo, { fontFamily, flex: 1 }]} numberOfLines={1}>
          {seccion === 0 ? t('por_ver') : t('vistas')}
        </Text>
        <View style={styles.actionsTopRow}>
          <Pressable onPress={() => setShowFilters(true)} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="options-outline" size={26} color="#fff" />
          </Pressable>
          <Pressable onPress={() => setBuscar(!buscar)} hitSlop={8} style={styles.iconBtn}>
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

      <View style={[styles.tabs, { top: Math.max(insets.top, 12) + 96 }]}>
        <Pressable onPress={() => setSeccion(0)}>
          <Text style={[styles.tab, { fontFamily }, seccion === 0 && styles.tabActivo]}>
            {t('por_ver')}
          </Text>
        </Pressable>
        <Pressable onPress={() => setSeccion(1)}>
          <Text style={[styles.tab, { fontFamily }, seccion === 1 && styles.tabActivo]}>
            {t('vistas')}
          </Text>
        </Pressable>
      </View>

      {buscar && (
        <LiquidGlassPanel
          style={[
            styles.searchGlass,
            SHADOWS.macLight,
            { top: Math.max(insets.top, 12) + 144 },
          ]}
          contentStyle={styles.searchGlassContent}
          intensity={95}
        >
          <TextInput
            value={textoBuscar}
            onChangeText={setTextoBuscar}
            placeholder={t('search')}
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={[styles.searchField, { fontFamily }]}
            autoFocus
          />
        </LiquidGlassPanel>
      )}

      {cargando ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 200 }} />
      ) : (
        <FlatList
          ref={listRef}
          data={rowsData}
          keyExtractor={(p, i) => String(i)}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: (buscar ? 100 : 0) + Math.max(insets.top, 12) + 140,
            paddingBottom: 140,
          }}
          renderItem={({ item: r }) => {
            if (r.isHeader) {
              return (
                <View style={styles.monthHeader}>
                  <View style={styles.line} />
                  <Text style={[styles.monthTitle, { fontFamily }]}>{r.title}</Text>
                  <View style={styles.line} />
                </View>
              );
            }
            return (
              <View style={styles.moviesRow}>
                {r.items.map((p: any) => (
                  <BibliotecaMovieItem
                    key={p.idPelicula}
                    p={p}
                    fontFamily={fontFamily}
                    misPlataformas={misPlataformas}
                    onPeliculaClick={onPeliculaClick}
                  />
                ))}
                {r.items.length < 3 && <View style={{ flex: 3 - r.items.length }} />}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.empty, { fontFamily }]}>
              {buscar ? t('no_results') : seccion === 0 ? t('empty_por_ver') : t('empty_vistas')}
            </Text>
          }
        />
      )}

      <FilterSortMenu
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title={t('sort')}
        options={[
          { label: t('recientes'), value: 'recientes', icon: 'time-outline' },
          { label: t('alpha'), value: 'alpha', icon: 'text-outline' },
          { label: t('fecha_peli'), value: 'fecha_peli', icon: 'calendar-outline' },
          { label: t('valoracion'), value: 'valoracion', icon: 'star-outline' },
        ]}
        currentValue={orden}
        onSelect={handleSetOrden}
        filterTitle={t('platforms')}
      />
    </View>
  );
}

function BibliotecaMovieItem({
  p,
  fontFamily,
  misPlataformas,
  onPeliculaClick,
}: {
  p: any;
  fontFamily: string;
  misPlataformas: number[];
  onPeliculaClick: any;
}) {
  const [providers, setProviders] = useState<{ flatrate: number[]; rent: number[] } | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await tmdbApi.obtenerDondeVerConCache(p.idPelicula);
        const resES = res.results?.['ES'];
        if (active) {
          setProviders({
            flatrate: resES?.flatrate?.map((pr: any) => pr.provider_id) || [],
            rent: [...(resES?.rent || []), ...(resES?.buy || [])].map((pr: any) => pr.provider_id),
          });
        }
      } catch (e) {}
    })();
    return () => {
      active = false;
    };
  }, [p.idPelicula]);

  const hasDot = useMemo(() => {
    if (!providers) return false;
    return (
      providers.flatrate.some((pid) => misPlataformas.includes(pid)) ||
      providers.rent.some((pid) => misPlataformas.includes(pid))
    );
  }, [providers, misPlataformas]);

  const dotColor = useMemo(() => {
    if (!providers) return 'transparent';
    return providers.flatrate.some((pid) => misPlataformas.includes(pid)) ? '#2ecc71' : '#f39c12';
  }, [providers, misPlataformas]);

  return (
    <View style={{ width: CARD_WIDTH, margin: 6 }}>
      <Pressable
        style={[styles.card, SHADOWS.macLight]}
        onPress={() => onPeliculaClick(p.idPelicula)}
      >
        {p.rutaPoster ? (
          <Image source={{ uri: posterUrl(p.rutaPoster, 'w342')! }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.noPoster]}>
            <Text style={[styles.noPosterText, { fontFamily }]} numberOfLines={3}>
              {p.titulo}
            </Text>
          </View>
        )}
        {hasDot && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
        <RatingBadge rating={p.valoracion} fontFamily={fontFamily} />
      </Pressable>
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
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tabs: {
    position: 'absolute',
    alignSelf: 'center',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    zIndex: 100,
  },
  tab: { fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  tabActivo: { color: '#fff', fontWeight: '800' },
  searchField: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 20,
  },
  searchGlass: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 110,
    height: 50,
  },
  searchGlassContent: {
    flex: 1,
    justifyContent: 'center',
  },
  tabsHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 90,
    overflow: 'hidden',
    borderWidth: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  card: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 16,
    backgroundColor: CardSurface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  poster: { width: '100%', height: '100%' },
  noPoster: { justifyContent: 'center', padding: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  noPosterText: { color: '#fff', fontSize: 12, textAlign: 'center' },
  empty: { color: '#888', textAlign: 'center', marginTop: 100, fontSize: 16 },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  monthTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  moviesRow: { flexDirection: 'row', width: '100%' },
});
