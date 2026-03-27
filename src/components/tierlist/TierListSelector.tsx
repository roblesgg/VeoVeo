import React, { useState, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { posterUrl } from '../../services/tmdbClient';
import type { PeliculaUsuario } from '../../types/peliculaUsuario';
import { AccentBorder, CardSurface, GlassBorder } from '../../theme/colors';

type Props = {
  peliculas: PeliculaUsuario[];
  seleccionadas: number[];
  onToggle: (id: number) => void;
  fontFamily: string;
};

export const TierListSelector = React.memo(({ peliculas, seleccionadas, onToggle, fontFamily }: Props) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return peliculas;
    return peliculas.filter(p => p.titulo.toLowerCase().includes(q));
  }, [peliculas, search]);

  if (peliculas.length === 0) {
    return <Text style={[styles.hint, { fontFamily }]}>No tienes películas vistas para añadir.</Text>;
  }

  return (
    <View style={styles.flex}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Filtrar por nombre..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          style={[styles.searchInput, { fontFamily }]}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#666" /></Pressable>
        ) : null}
      </View>

      <View style={styles.container}>
        {filtered.map((p) => {
          const selected = seleccionadas.includes(p.idPelicula);
          return (
            <Pressable
              key={p.idPelicula}
              style={[styles.selectCard, selected && styles.selectCardOn]}
              onPress={() => onToggle(p.idPelicula)}
            >
              {p.rutaPoster ? (
                <Image source={{ uri: posterUrl(p.rutaPoster, 'w185')! }} style={styles.selectPoster} />
              ) : (
                <View style={[styles.selectPoster, styles.posterFallback]}>
                  <Text style={[styles.posterFallbackText, { fontFamily }]} numberOfLines={3}>{p.titulo}</Text>
                </View>
              )}
              <View style={styles.checkDot}>
                <Ionicons 
                  name={selected ? 'checkbox' : 'square'} 
                  size={20} 
                  color={selected ? AccentBorder : 'rgba(255,255,255,0.2)'} 
                />
              </View>
            </Pressable>
          );
        })}
        {filtered.length === 0 && <Text style={[styles.hint, { fontFamily, width: '100%' }]}>Sin resultados</Text>}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 14, 
    paddingHorizontal: 12, 
    height: 44, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: GlassBorder,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  selectCard: { width: '48%', aspectRatio: 0.67, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  selectCardOn: { borderColor: AccentBorder },
  selectPoster: { width: '100%', height: '100%' },
  checkDot: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4 },
  posterFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: CardSurface },
  posterFallbackText: { color: '#fff', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 },
  hint: { marginTop: 8, color: '#888', fontSize: 14, textAlign: 'center' },
});
