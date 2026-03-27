import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  rating: number;
  fontFamily?: string;
};

export function RatingBadge({ rating, fontFamily }: Props) {
  if (rating === 0) return null;

  const isPoop = rating === -1;
  
  // Dynamic styling based on rating
  let iconColor = '#FFD700'; // Gold default
  let glow = false;
  let textColor = '#fff';

  if (rating >= 5) {
    iconColor = '#FFD700';
    glow = true;
  } else if (rating >= 3) {
    iconColor = '#FFC107'; // Amber
  } else if (rating > 0) {
    iconColor = '#FF9800'; // Orange
  }

  return (
    <View style={[styles.badge, glow && styles.glow]}>
      <View style={styles.inner}>
        {isPoop ? (
          <Text style={{ fontSize: 13 }}>💩</Text>
        ) : (
          <>
            <Ionicons 
              name="star" 
              size={glow ? 12 : 11} 
              color={iconColor} 
              style={{ marginRight: 2 }} 
            />
            <Text style={[styles.text, { fontFamily, color: textColor }]}>{rating}</Text>
          </>
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
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.25)',
    elevation: 5,
  },
  glow: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    borderWidth: 1.5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(15,15,25,0.95)',
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
  },
});
