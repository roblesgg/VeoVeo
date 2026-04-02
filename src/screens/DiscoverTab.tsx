import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TextInput, Pressable, 
  Image, Dimensions, ActivityIndicator, Keyboard 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tmdbApi, posterUrl } from '../services/tmdbClient';
import { CarruselPeliculas } from '../components/discover/CarruselPeliculas';
import { SHADOWS } from '../theme/theme';
import { GradientTop, CardSurface } from '../theme/colors';

const { width: windowWidth } = Dimensions.get('window');

type Props = {
  fontFamily: string;
  estaActiva: boolean;
  onPeliculaClick: (id: number) => void;
  onActorClick: (id: number, name: string) => void;
  onPerfilClick?: () => void;
  userFoto?: string | null;
  resetToken?: number;
};

import { useLanguage } from '../context/LanguageContext';

export function DiscoverTab({ fontFamily, estaActiva, onPeliculaClick, onActorClick, onPerfilClick, userFoto, resetToken = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const mainListRef = useRef<FlatList>(null);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (resetToken > 0) {
      if (buscarAtiva) {
        setBuscarAtiva(false);
        setTextoBuscar('');
      } else {
        mainListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    }
  }, [resetToken]);

  const [carruselesActivos, setCarruselesActivos] = useState<string[]>([]);
  const [buscarAtiva, setBuscarAtiva] = useState(false);
  const [textoBuscar, setTextoBuscar] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);

  useEffect(() => {
    if (estaActiva) {
      setCarruselesActivos(['trending', 'popular', 'now_playing', 'top_rated']);
    }
  }, [estaActiva]);

  const handleSearch = async (query: string) => {
    setTextoBuscar(query);
      if (query.trim().length > 2) {
      setCargandoBusqueda(true);
      try {
        const response = await tmdbApi.buscarPeliculas(query);
        setResultadosBusqueda(response.results);
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoBusqueda(false);
      }
    } else {
      setResultadosBusqueda([]);
    }
  };

  const toggleSearch = () => {
    const newState = !buscarAtiva;
    setBuscarAtiva(newState);
    if (newState) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setTextoBuscar('');
      setResultadosBusqueda([]);
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { fontFamily }]}>VeoVeo</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={toggleSearch} style={styles.iconCircle}>
            <Ionicons name="search-outline" size={24} color="#fff" />
          </Pressable>
          <Pressable onPress={onPerfilClick} style={styles.perfilBtn}>
            <BlurView intensity={30} tint="dark" style={styles.perfilInner}>
              {userFoto ? (
                <Image source={{ uri: userFoto }} style={styles.perfilFoto} />
              ) : (
                <Ionicons name="person" size={20} color="#fff" />
              )}
            </BlurView>
          </Pressable>
        </View>
      </View>

      {buscarAtiva && (
        <View style={[styles.searchOverlay, { paddingTop: insets.top + 10 }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.searchBarContainer}>
            <TextInput
              ref={searchInputRef}
              value={textoBuscar}
              onChangeText={handleSearch}
              placeholder={t('search')}
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={[styles.searchBar, { fontFamily }]}
              autoFocus
            />
            <Pressable onPress={toggleSearch}>
              <Text style={[styles.closeSearch, { fontFamily }]}>{t('cancel')}</Text>
            </Pressable>
          </View>

          {cargandoBusqueda ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={resultadosBusqueda}
              keyExtractor={(item) => String(item.id)}
              numColumns={3}
              columnWrapperStyle={{ gap: 12, marginBottom: 12, paddingHorizontal: 20 }}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }) => (
                <Pressable 
                  onPress={() => onPeliculaClick(item.id)}
                  style={({ pressed }) => [
                    styles.searchCard,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] }
                  ]}
                >
                  {item.poster_path ? (
                    <Image source={{ uri: posterUrl(item.poster_path, 'w342')! }} style={styles.searchPoster} />
                  ) : (
                    <View style={styles.noPosterSearch}>
                      <Text style={styles.noPosterTextSearch} numberOfLines={3}>{item.title}</Text>
                    </View>
                  )}
                  {item.vote_average > 0 && (
                    <View style={styles.searchBadge}>
                      <Text style={styles.searchBadgeText}>{item.vote_average.toFixed(1)}</Text>
                    </View>
                  )}
                </Pressable>
              )}
            />
          )}
        </View>
      )}

      <FlatList
        ref={mainListRef}
        data={carruselesActivos}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <CarruselPeliculas
            categoria={item as any}
            titulo={t(item as any)}
            fontFamily={fontFamily}
            onPeliculaClick={onPeliculaClick}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 25, 
    paddingBottom: 20, 
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  title: { fontSize: 32, fontWeight: '800', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  perfilBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  perfilInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  perfilFoto: { width: '100%', height: '100%' },
  
  searchOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  searchBarContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingHorizontal: 20, 
    paddingBottom: 20
  },
  searchBar: { 
    flex: 1, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20, 
    color: '#fff', 
    fontSize: 16 
  },
  closeSearch: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  searchCard: { 
    flex: 1/3, 
    aspectRatio: 2/3, 
    borderRadius: 16, 
    overflow: 'hidden', 
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  searchPoster: { width: '100%', height: '100%' },
  noPosterSearch: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  noPosterTextSearch: { color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'center' },
  searchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  searchBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' }
});
