import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AccentBorder } from '../../theme/colors';
import { SHADOWS } from '../../theme/theme';

type Props = {
  user: any;
  estadoPelicula: 0 | 1 | 2;
  accionBib: boolean;
  bibCargando: boolean;
  onPorVer: () => void;
  onVista: () => void;
  fontFamily: string;
};

export const MovieActions = React.memo(({ 
  user, estadoPelicula, accionBib, bibCargando, onPorVer, onVista, fontFamily 
}: Props) => {
  return (
    <View style={[styles.actionsGlass, SHADOWS.mac]}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 10, 20, 0.92)' }]} />
      
      <View style={styles.actionsInner}>
        {!user ? (
          <Text style={styles.aviso}>Inicia sesión para guardar en tu biblioteca.</Text>
        ) : bibCargando ? (
          <ActivityIndicator color="#fff" style={{ marginVertical: 16 }} />
        ) : (
          <View style={styles.rowBotones}>
            <Pressable
              style={[styles.btnBib, estadoPelicula === 1 && styles.btnBibActivo]}
              onPress={onPorVer}
              disabled={accionBib}
            >
              <Ionicons name={estadoPelicula === 1 ? "checkmark" : "add"} size={18} color={estadoPelicula === 1 ? "#fff" : AccentBorder} />
              <Text style={[styles.btnBibText, { fontFamily, color: estadoPelicula === 1 ? '#fff' : AccentBorder }]}>
                {estadoPelicula === 1 ? 'En Por Ver' : 'Por Ver'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.btnBib, estadoPelicula === 2 && styles.btnBibVista]}
              onPress={onVista}
              disabled={accionBib}
            >
              <Ionicons name={estadoPelicula === 2 ? "checkmark-circle" : "eye-outline"} size={18} color={estadoPelicula === 2 ? "#fff" : "#4CAF50"} />
              <Text style={[styles.btnBibText, { fontFamily, color: estadoPelicula === 2 ? '#fff' : '#4CAF50' }]}>
                {estadoPelicula === 2 ? 'Vista' : 'Vista'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  actionsGlass: { borderRadius: 28, marginBottom: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  actionsInner: { padding: 20 },
  rowBotones: { flexDirection: 'row', gap: 12 },
  btnBib: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  btnBibActivo: { backgroundColor: AccentBorder, borderColor: AccentBorder },
  btnBibVista: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  btnBibText: { fontSize: 14, fontWeight: '600' },
  aviso: { color: '#ffcc80', marginVertical: 12, fontSize: 14, textAlign: 'center' },
});
