import React, { useState } from 'react';
import { 
  ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, 
  Text, TextInput, View 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hooks
import { useSocialData } from '../hooks/social/useSocialData';

// Modular Components
import { FriendRow } from '../components/social/FriendRow';
import { UserSearchRow } from '../components/social/UserSearchRow';
import { SolicitudesBadge } from '../components/social/SolicitudesBadge';
import { GlassSurface, GlassBorder, GradientTop } from '../theme/colors';

type Props = {
  fontFamily: string;
  onUsuarioClick: (uid: string) => void;
  onSolicitudesClick: () => void;
  onChatClick: () => void;
  onPerfilClick?: () => void;
  userFoto?: string | null;
};

export function SocialTab({ fontFamily, onUsuarioClick, onSolicitudesClick, onChatClick, onPerfilClick, userFoto }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<0 | 1>(0); // 0 amigos, 1 buscar

  const { 
    amigos, resultados, solPendientesCount, solEnviadas, 
    busqueda, setBusqueda, cargando, error, mensaje, 
    handleSendSolicitud, handleEliminarAmigo, handleBloquear 
  } = useSocialData();

  return (
    <View style={styles.flex}>
      <LinearGradient colors={[GradientTop, 'transparent']} style={styles.topFade} pointerEvents="none" />
      
      <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
        <Text style={[styles.titulo, { fontFamily, flex: 1 }]} numberOfLines={1}>Social</Text>
        <View style={styles.actionsTopRow}>
          <Pressable onPress={() => onChatClick()} style={styles.perfilBtnMini} hitSlop={8}>
            <BlurView intensity={30} tint="dark" style={styles.perfilInnerMini}>
                <Ionicons name="chatbubbles-outline" size={22} color="#fff" />
            </BlurView>
          </Pressable>
          <Pressable onPress={() => onPerfilClick?.()} style={styles.perfilBtnMini} hitSlop={8}>
            <BlurView intensity={30} tint="dark" style={styles.perfilInnerMini}>
              {userFoto ? (
                <Image source={{ uri: userFoto }} style={styles.perfilFotoMini} />
              ) : (
                <Ionicons name="person" size={20} color="#fff" />
              )}
            </BlurView>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <SolicitudesBadge 
          count={solPendientesCount} 
          onPress={onSolicitudesClick} 
          fontFamily={fontFamily} 
        />

        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            <Pressable onPress={() => setTab(0)} style={[styles.tabBtn, tab === 0 && styles.tabOnBtn]}>
              <Text style={[styles.tabText, tab === 0 && styles.tabOnText, { fontFamily }]}>Amigos</Text>
            </Pressable>
            <Pressable onPress={() => setTab(1)} style={[styles.tabBtn, tab === 1 && styles.tabOnBtn]}>
              <Text style={[styles.tabText, tab === 1 && styles.tabOnText, { fontFamily }]}>Buscar</Text>
            </Pressable>
          </View>
        </View>

        {tab === 1 && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar por nombre..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={[styles.searchField, { fontFamily }]}
            />
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
        {mensaje && <Text style={styles.successText}>{mensaje}</Text>}

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {cargando && <ActivityIndicator color="#6C63FF" style={{ marginTop: 20 }} />}

          {tab === 0 ? (
            amigos.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={[styles.emptyText, { fontFamily }]}>No tienes amigos aún</Text>
              </View>
            ) : (
              amigos.map(a => (
                <FriendRow 
                  key={a.uid} 
                  amigo={a} 
                  onPress={() => onUsuarioClick(a.uid)} 
                  onEliminar={() => handleEliminarAmigo(a.uid)}
                  onBloquear={() => handleBloquear(a.uid)}
                  fontFamily={fontFamily}
                />
              ))
            )
          ) : (
            resultados.length === 0 && busqueda.length >= 2 ? (
              <Text style={[styles.emptyText, { fontFamily, marginTop: 40 }]}>Sin resultados</Text>
            ) : (
              resultados.map(u => (
                <UserSearchRow 
                  key={u.uid} 
                  usuario={{ ...u, fotoPerfil: u.fotoPerfil || undefined }} 
                  enviada={solEnviadas.has(u.uid)} 
                  onAdd={() => handleSendSolicitud(u.uid)}
                  fontFamily={fontFamily}
                />
              ))
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titulo: { color: '#fff', fontSize: 34, fontWeight: '800' },
  headerRow: { 
    position: 'absolute', 
    left: 24, 
    right: 24, 
    zIndex: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  actionsTopRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  perfilBtnMini: { marginLeft: 4 },
  perfilInnerMini: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.4)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  perfilFotoMini: { width: '100%', height: '100%' },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 1 },
  content: { flex: 1, paddingTop: 140 },
  tabContainer: { paddingHorizontal: 20, marginTop: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabOnBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  tabOnText: { color: '#fff' },
  searchContainer: { marginHorizontal: 20, marginTop: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: GlassSurface, borderRadius: 18, borderWidth: 1, borderColor: GlassBorder, paddingHorizontal: 16, height: 54 },
  searchField: { flex: 1, color: '#fff', fontSize: 16 },
  scroll: { paddingHorizontal: 20, paddingBottom: 140, paddingTop: 10 },
  empty: { marginTop: 80, alignItems: 'center', gap: 16 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16, textAlign: 'center' },
  errorText: { color: '#ff8a80', textAlign: 'center', marginTop: 12 },
  successText: { color: '#7CFC9A', textAlign: 'center', marginTop: 12 },
});
