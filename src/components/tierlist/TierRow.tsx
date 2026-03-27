import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { posterUrl } from '../../services/tmdbClient';
import type { PeliculaUsuario } from '../../types/peliculaUsuario';
import { CardSurface } from '../../theme/colors';

type TierKey = 'tierObraMaestra' | 'tierMuyBuena' | 'tierBuena' | 'tierMala' | 'tierNefasta';

type Props = {
  tierKey?: TierKey; // Optional, only if we want to support reordering
  titulo: string;
  ids: number[];
  peliculasMap: Record<number, PeliculaUsuario>;
  fontFamily: string;
  onPeliculaClick: (movieId: number) => void;
  onReorder?: (newOrder: number[]) => void;
};

export const TierRow = React.memo(({ titulo, ids, peliculasMap, fontFamily, onPeliculaClick, onReorder }: Props) => {
  
  const renderItem = ({ item: id, drag, isActive }: RenderItemParams<number>) => {
    const p = peliculasMap[id];
    return (
      <ScaleDecorator>
        <Pressable 
          style={[styles.tierMovieCard, isActive && { opacity: 0.7, transform: [{ scale: 1.1 }] }]} 
          onPress={() => onPeliculaClick(id)}
          onLongPress={onReorder ? drag : undefined}
          disabled={isActive}
        >
          {p?.rutaPoster ? (
            <Image source={{ uri: posterUrl(p.rutaPoster, 'w185')! }} style={styles.tierMoviePoster} />
          ) : (
            <View style={[styles.tierMoviePoster, styles.posterFallback]} />
          )}
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <Pressable style={styles.tierRow} onPress={() => onPeliculaClick(0)}>
      <View style={styles.tierLabel}>
        <Text style={[styles.tierLabelText, { fontFamily }]}>{titulo}</Text>
      </View>
      <View style={styles.tierContent} pointerEvents="box-none">
        {ids.length === 0 ? (
          <Text style={[styles.tierEmpty, { fontFamily }]}>Vacío (Toca para soltar aquí)</Text>
        ) : onReorder ? (
          <DraggableFlatList
            horizontal
            data={ids}
            keyExtractor={(id) => String(id)}
            onDragEnd={({ data }) => onReorder(data)}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 40 }}
          />
        ) : (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {ids.map(id => {
              const p = peliculasMap[id];
              return (
                <Pressable key={id} style={styles.tierMovieCard} onPress={() => onPeliculaClick(id)}>
                   {p?.rutaPoster ? (
                    <Image source={{ uri: posterUrl(p.rutaPoster, 'w185')! }} style={styles.tierMoviePoster} />
                  ) : (
                    <View style={[styles.tierMoviePoster, styles.posterFallback]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tierRow: { flexDirection: 'row', marginTop: 10, minHeight: 110, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tierLabel: { width: 90, backgroundColor: '#3D2A54', justifyContent: 'center', paddingLeft: 8 },
  tierLabelText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tierContent: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 8 },
  tierEmpty: { color: '#777', textAlign: 'center' },
  tierMovieCard: { width: 60, aspectRatio: 0.67, borderRadius: 4, overflow: 'hidden', backgroundColor: CardSurface },
  tierMoviePoster: { width: '100%', height: '100%' },
  posterFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: CardSurface },
});
