import React, { useState, useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { posterUrl } from '../../services/tmdbClient';
import type { PeliculaUsuario } from '../../types/peliculaUsuario';
import { CardSurface, GlassBorder, AccentBorder } from '../../theme/colors';

type Props = {
  ids: number[];
  peliculasMap: Record<number, PeliculaUsuario>;
  onMovieClick: (id: number) => void;
  fontFamily: string;
  hideSearch?: boolean;
  selectedId?: number | null;
};

export const MoviePool = React.memo(({ ids, peliculasMap, onMovieClick, fontFamily, hideSearch, selectedId }: Props) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ids;
    return ids.filter(id => {
      const p = peliculasMap[id];
      return p?.titulo.toLowerCase().includes(q);
    });
  }, [ids, peliculasMap, search]);

  if (ids.length === 0) return null;

  return (
    <View style={styles.container}>
      {!hideSearch && (
        <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 6 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar pendientes..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          style={[styles.searchInput, { fontFamily }]}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color="#666" /></Pressable>
        ) : null}
      </View>
      )}

      <FlatList
        horizontal
        data={filtered}
        keyExtractor={(id) => String(id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
        renderItem={({ item: id }) => {
          const p = peliculasMap[id];
          const isSelected = id === selectedId;
          return (
            <Pressable 
              style={[styles.poolCard, isSelected && styles.poolCardSelected]} 
              onPress={() => onMovieClick(id)}
            >
              {p?.rutaPoster ? (
                <Image source={{ uri: posterUrl(p.rutaPoster, 'w185')! }} style={styles.poolPoster} />
              ) : (
                <View style={[styles.poolPoster, styles.posterFallback]}>
                  <Text style={[styles.posterFallbackText, { fontFamily }]} numberOfLines={3}>{p?.titulo ?? '?'}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={[styles.hint, { fontFamily }]}>Sin resultados</Text>}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, 
    paddingHorizontal: 10, 
    height: 38, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: GlassBorder,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },
  poolCard: { width: 80, aspectRatio: 0.67, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  poolCardSelected: { borderColor: AccentBorder, opacity: 0.7, transform: [{ scale: 1.05 }] },
  poolPoster: { width: '100%', height: '100%' },
  posterFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: CardSurface },
  posterFallbackText: { color: '#fff', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 },
  hint: { color: '#666', fontSize: 12, alignSelf:'center', marginTop: 10 },
});
