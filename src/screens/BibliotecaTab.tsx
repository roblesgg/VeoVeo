import React, { useState, useMemo, useEffect } from 'react';
import { 
  ActivityIndicator, Dimensions, FlatList, Image, Pressable, 
  StyleSheet, Text, TextInput, View, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useLibraryData } from '../hooks/movie/useLibraryData';
import { posterUrl, tmdbApi } from '../services/tmdbClient';
import { CardSurface, GradientTop } from '../theme/colors';
import { SHADOWS } from '../theme/theme';
import { FilterSortMenu, FilterSortOption } from '../components/FilterSortMenu';
import { RatingBadge } from '../components/RatingBadge';
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
};

export function BibliotecaTab({ fontFamily, refreshToken = 0, onPeliculaClick, onPerfilClick, userFoto, resetToken = 0 }: Props) {
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
  const [orden, setOrden] = useState<'recientes' | 'alpha' | 'fecha_peli' | 'valoracion'>('recientes');
  const [plataformas, setPlataformas] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [misPlataformas, setMisPlataformas] = useState<number[]>([]);

  const { t } = useLanguage();
  const [allProviderNames, setAllProviderNames] = useState<Record<number, string>>({});

  const { porVer, vistas, cargando } = useLibraryData(user, refreshToken);

  useEffect(() => {
    void (async () => {
      try {
        const res = await tmdbApi.obtenerProveedoresRegion('ES');
        const map: Record<number, string> = {};
        res.results.forEach((p: any) => {
          map[p.provider_id] = p.provider_name;
        });
        setAllProviderNames(map);
      } catch (e) {
        console.error('Error loading provider names:', e);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      const savedOrden = await preferences.cargarOrdenBiblioteca(seccion === 0 ? 'por_ver' : 'vistas');
      const plots = await preferences.cargarPlataformas();
      if (savedOrden) setOrden(savedOrden as any);
      setMisPlataformas(plots.map(Number));
    })();
  }, [refreshToken, seccion]);

  const handleSetOrden = async (val: any) => {
    setOrden(val);
    await preferences.guardarOrdenBiblioteca(seccion === 0 ? 'por_ver' : 'vistas', val);
  };

  const listaFiltrada = useMemo(() => {
    const raw = seccion === 0 ? porVer : vistas;
    let base = [...raw];
    
    if (orden === 'alpha') base.sort((a, b) => a.titulo.localeCompare(b.titulo));
    else if (orden === 'fecha_peli') base.sort((a, b) => (b.fechaLanzamiento || '').localeCompare(a.fechaLanzamiento || ''));
    else if (orden === 'valoracion') base.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
    else {
      if (seccion === 1) base.sort((a, b) => (b.fechaVisto || b.fechaAnadido) - (a.fechaVisto || a.fechaAnadido));
      else base.sort((a, b) => b.fechaAnadido - a.fechaAnadido);
    }

    const qBase = textoBuscar.trim().toLowerCase();
    let filtered = qBase ? base.filter((p: any) => p.titulo.toLowerCase().includes(qBase)) : base;

    return filtered;
  }, [porVer, vistas, seccion, textoBuscar, orden]);

  const platformOptions: FilterSortOption[] = useMemo(() => {
    const plats = misPlataformas.map(id => ({
      label: allProviderNames[id] || `ID: ${id}`,
      value: id,
      icon: 'tv-outline' as any,
    }));
    return [
      { label: 'Mostrar todo', value: 'all', icon: 'eye-outline' as any },
      ...plats
    ];
  }, [misPlataformas, allProviderNames]);

  return (
    <View style={styles.flex}>
      <View style={[styles.tabsHeaderOverlay, { height: Math.max(insets.top, 12) + 130 }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient colors={[GradientTop, 'transparent']} style={StyleSheet.absoluteFill} />
      </View>

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
        <Pressable onPress={() => setSeccion(0)}><Text style={[styles.tab, { fontFamily }, seccion === 0 && styles.tabActivo]}>{t('por_ver')}</Text></Pressable>
        <Pressable onPress={() => setSeccion(1)}><Text style={[styles.tab, { fontFamily }, seccion === 1 && styles.tabActivo]}>{t('vistas')}</Text></Pressable>
      </View>

      {buscar && (
        <TextInput
          value={textoBuscar}
          onChangeText={setTextoBuscar}
          placeholder={t('search')}
          placeholderTextColor="rgba(255,255,255,0.5)"
          style={[styles.searchField, SHADOWS.macLight, { fontFamily, top: Math.max(insets.top, 12) + 144 }]}
        />
      )}

      {cargando ? <ActivityIndicator color="#fff" style={{ marginTop: 200 }} /> : (
        <FlatList
          ref={listRef}
          data={listaFiltrada}
          extraData={misPlataformas}
          keyExtractor={(p) => String(p.idPelicula)}
          numColumns={3}
          contentContainerStyle={{ 
            paddingHorizontal: 25, 
            paddingTop: (buscar ? 100 : 0) + Math.max(insets.top, 12) + 140, 
            paddingBottom: 140 
          }}
          renderItem={({ item: p }) => (
            <BibliotecaMovieItem
              p={p}
              fontFamily={fontFamily}
              misPlataformas={misPlataformas}
              onPeliculaClick={onPeliculaClick}
            />
          )}
          columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
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
        filters={platformOptions}
        multiSelect={true}
        selectedFilters={plataformas.length === 0 ? ['all'] : plataformas}
        onToggleFilter={(val) => {
          if (val === 'all') {
            setPlataformas([]);
          } else {
            setPlataformas(prev => 
              prev.includes(val) ? prev.filter(id => id !== val) : [...prev, val]
            );
          }
        }}
        filterTitle={t('platforms')}
      />
    </View>
  );
}

function BibliotecaMovieItem({ p, fontFamily, misPlataformas, onPeliculaClick }: { p: any, fontFamily: string, misPlataformas: number[], onPeliculaClick: any }) {
  const [providers, setProviders] = useState<{ flatrate: number[], rent: number[] } | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await tmdbApi.obtenerDondeVer(p.idPelicula);
        const resES = res.results?.['ES'];
        if (active) {
          setProviders({
            flatrate: resES?.flatrate?.map((pr: any) => pr.provider_id) || [],
            rent: [...(resES?.rent || []), ...(resES?.buy || [])].map((pr: any) => pr.provider_id)
          });
        }
      } catch (e) {
        // Silencio
      }
    })();
    return () => { active = false; };
  }, [p.idPelicula]);

  const hasDot = useMemo(() => {
    if (!providers) return false;
    return providers.flatrate.some(pid => misPlataformas.includes(pid)) || 
           providers.rent.some(pid => misPlataformas.includes(pid));
  }, [providers, misPlataformas]);

  const dotColor = useMemo(() => {
    if (!providers) return 'transparent';
    return providers.flatrate.some(pid => misPlataformas.includes(pid)) ? '#2ecc71' : '#f39c12';
  }, [providers, misPlataformas]);

  return (
    <Pressable style={[styles.card, SHADOWS.macLight]} onPress={() => onPeliculaClick(p.idPelicula)}>
      {p.rutaPoster ? (
        <Image source={{ uri: posterUrl(p.rutaPoster, 'w342')! }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.noPoster]}>
          <Text style={[styles.noPosterText, { fontFamily }]} numberOfLines={3}>{p.titulo}</Text>
        </View>
      )}
      {hasDot && (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      )}
      <RatingBadge rating={p.valoracion} fontFamily={fontFamily} />
    </Pressable>
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
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tabs: { position: 'absolute', alignSelf: 'center', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 24, zIndex: 10 },
  tab: { fontSize: 18, color: '#888' },
  tabActivo: { color: '#fff', fontWeight: '800' },
  searchField: { position: 'absolute', left: 20, right: 20, zIndex: 15, borderRadius: 24, backgroundColor: CardSurface, paddingHorizontal: 20, height: 50, color: '#fff' },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 5 },
  tabsHeaderOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9, overflow: 'hidden' },
  card: { width: CARD_WIDTH, aspectRatio: 2 / 3, borderRadius: 16, backgroundColor: CardSurface, overflow: 'hidden' },
  poster: { width: '100%', height: '100%' },
  noPoster: { justifyContent: 'center', padding: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  noPosterText: { color: '#fff', fontSize: 12, textAlign: 'center' },
  empty: { color: '#888', textAlign: 'center', marginTop: 100, fontSize: 16 },
  filtersScroll: { position: 'absolute', left: 0, right: 0, zIndex: 10, height: 40 },
  filterChip: { 
    paddingHorizontal: 16, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterChipActivo: { backgroundColor: '#fff', borderColor: '#fff' },
  filterText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
  filterTextActivo: { color: '#000' },
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
    elevation: 3
  },
});
