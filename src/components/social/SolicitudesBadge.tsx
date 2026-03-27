import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  count: number;
  onPress: () => void;
  fontFamily: string;
};

export const SolicitudesBadge = React.memo(({ count, onPress, fontFamily }: Props) => {
  if (count === 0) return null;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#FF5722', '#F44336']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Ionicons name="people" size={18} color="#fff" />
        <Text style={[styles.text, { fontFamily }]}>
          {count} solicitud(es) pendientes
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginTop: 12 },
  gradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  text: { color: '#fff', flex: 1, fontSize: 15, fontWeight: '700' },
});
