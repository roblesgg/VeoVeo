import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { posterUrl } from '../../services/tmdbClient';
import type { PeliculaUsuario } from '../../types';
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

// 🚀 [MEMO] Item de Película en Tier para evitar re-renders masivos
const TierMovieItem = React.memo(({ 
  id, 
  rutaPoster, 
  onPeliculaClick, 
  onLongPress, 
  isActive 
}: { 
  id: number, 
  rutaPoster?: string | null, 
  onPeliculaClick: (id: number) => void, 
  onLongPress?: () => void, 
  isActive?: boolean 
}) => (
  <Pressable
    style={[
      styles.tierMovieCard,
      isActive && { opacity: 0.7, transform: [{ scale: 1.1 }] },
    ]}
    onPress={() => onPeliculaClick(id)}
    onLongPress={onLongPress}
    disabled={isActive}
  >
    {rutaPoster ? (
      <ExpoImage
        source={{ uri: posterUrl(rutaPoster, 'w185')! }}
        style={styles.tierMoviePoster}
        contentFit="cover"
        transition={150}
      />
    ) : (
      <View style={[styles.tierMoviePoster, styles.posterFallback]} />
    )}
  </Pressable>
));
TierMovieItem.displayName = 'TierMovieItem';

export const TierRow = React.memo(
  ({ titulo, ids, peliculasMap, fontFamily, onPeliculaClick, onReorder }: Props) => {
    const renderItem = React.useCallback(({ item: id, drag, isActive }: RenderItemParams<number>) => {
      const p = peliculasMap[id];
      return (
        <ScaleDecorator>
          <TierMovieItem 
            id={id}
            rutaPoster={p?.rutaPoster}
            onPeliculaClick={onPeliculaClick}
            onLongPress={drag}
            isActive={isActive}
          />
        </ScaleDecorator>
      );
    }, [peliculasMap, onPeliculaClick]);

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
              {ids.map((id) => (
                <TierMovieItem 
                  key={id}
                  id={id}
                  rutaPoster={peliculasMap[id]?.rutaPoster}
                  onPeliculaClick={onPeliculaClick}
                />
              ))}
            </View>
          )}
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  tierRow: {
    flexDirection: 'row',
    marginTop: 10,
    minHeight: 110,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tierLabel: { width: 90, backgroundColor: '#3D2A54', justifyContent: 'center', paddingLeft: 8 },
  tierLabelText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tierContent: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 8,
  },
  tierEmpty: { color: '#777', textAlign: 'center' },
  tierMovieCard: {
    width: 60,
    aspectRatio: 0.67,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: CardSurface,
  },
  tierMoviePoster: { width: '100%', height: '100%' },
  posterFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: CardSurface },
});
