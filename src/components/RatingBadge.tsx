import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  rating: number; // 0-5 (Personal) o 0-10 (TMDB)
  maxRating?: number; // 5 o 10
  fontFamily?: string;
  hideText?: boolean;
};

export function RatingBadge({ rating: rawRating, maxRating = 5, fontFamily, hideText = true }: Props) {
  // Normalizar a escala de 5
  const rating = maxRating === 10 ? rawRating / 2 : rawRating;

  const ratingDescription = useMemo(() => {
    if (rating >= 4.5) return 'Obra Maestra';
    if (rating >= 4) return 'Espectacular';
    if (rating >= 3) return 'Muy buena';
    if (rating >= 2) return 'Recomendada';
    return 'Está bien';
  }, [rating]);

  if (rating === 0) return null;

  const isPoop = rawRating === -1;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let iconColor = '#FFD700'; 
  let glow = rating >= 4.5;

  if (rating >= 4.5) iconColor = '#FFD700';
  else if (rating >= 3.5) iconColor = '#FFC107';
  else iconColor = '#FF9800';

  return (
    <View style={[styles.badge, glow && styles.glow, hideText && styles.miniBadge]}>
      <View style={[styles.inner, hideText && styles.miniInner]}>
        {isPoop ? (
          <Text style={{ fontSize: 16 }}>💩</Text>
        ) : (
          <View style={styles.starsRow}>
            {[...Array(fullStars)].map((_, i) => (
              <Ionicons key={`f-${i}`} name="star" size={hideText ? 10 : 12} color={iconColor} />
            ))}
            {hasHalfStar && (
              <Ionicons name="star-half" size={hideText ? 10 : 12} color={iconColor} />
            )}
            {!hideText && [...Array(emptyStars)].map((_, i) => (
              <Ionicons key={`e-${i}`} name="star-outline" size={12} color="rgba(255,255,255,0.3)" />
            ))}
            {!hideText && (
              <Text style={[styles.text, { fontFamily, color: '#fff' }]}>
                {rating.toFixed(1)}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    elevation: 4,
  },
  miniBadge: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  glow: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,15,25,0.7)',
  },
  miniInner: {
    backgroundColor: 'transparent',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },
});
