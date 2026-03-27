import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PeliculaUsuario } from '../../types/peliculaUsuario';

type Props = {
  peliculaUsuario: PeliculaUsuario | null;
  onPress: () => void;
  fontFamily: string;
};

export const MovieRatingButton = React.memo(({ peliculaUsuario, onPress, fontFamily }: Props) => {
  if (!peliculaUsuario || peliculaUsuario.estado !== 'vista') return null;

  const { valoracion } = peliculaUsuario;
  const isPoop = valoracion === -1;

  return (
    <Pressable style={styles.btnValorar} onPress={onPress}>
      <Ionicons
        name="star"
        size={18}
        color={isPoop ? '#8B4513' : '#FFD700'}
      />
      <Text style={[styles.btnValorarText, { fontFamily }]}>
        {isPoop
          ? 'Valoración: 💩'
          : valoracion > 0
            ? `Valoración: ${valoracion} ⭐`
            : 'Añadir valoración'}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btnValorar: {
    marginTop: 12,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  btnValorarText: { color: '#FFD700', fontSize: 14, fontWeight: '600' },
});
