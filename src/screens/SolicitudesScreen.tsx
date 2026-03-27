import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { aceptarSolicitud, obtenerSolicitudesPendientes, rechazarSolicitud } from '../services/repositorioSocial';
import { GlassBorder, GlassSurface, GlassWhite } from '../theme/colors';
import { SHADOWS } from '../theme/theme';
import type { SolicitudAmistad } from '../types/solicitudAmistad';

type Props = { onVolverClick: () => void };

const Container = Platform.OS === 'ios' ? BlurView : View;

export function SolicitudesScreen({ onVolverClick }: Props) {
  const insets = useSafeAreaInsets();
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState<SolicitudAmistad[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await obtenerSolicitudesPendientes();
      setItems(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar solicitudes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const handleAceptar = async (id: string) => {
    setAccionEnCurso(id);
    try {
      await aceptarSolicitud(id);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al aceptar solicitud');
    } finally {
      setAccionEnCurso(null);
    }
  };

  const handleRechazar = async (id: string) => {
    setAccionEnCurso(id);
    try {
      await rechazarSolicitud(id);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al rechazar solicitud');
    } finally {
      setAccionEnCurso(null);
    }
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Pressable onPress={onVolverClick} style={styles.back} hitSlop={20}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.titulo}>Solicitudes</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#ff8a80" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {cargando && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.2)" />
              <Text style={styles.sub}>No tienes solicitudes pendientes.</Text>
            </View>
          ) : (
            items.map((s) => (
              <Container
                key={s.id}
                intensity={20}
                tint="dark"
                style={[styles.row, SHADOWS.macLight]}
              >
                <View style={styles.rowContent}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{s.deUsername.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.name}>{s.deUsername}</Text>
                      <Text style={styles.uid}>ID: {s.deUid.substring(0, 8)}...</Text>
                    </View>
                  </View>
                  
                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.btn, styles.btnOk, accionEnCurso === s.id && styles.disabled]}
                      onPress={() => handleAceptar(s.id)}
                      disabled={!!accionEnCurso}
                    >
                      <Text style={styles.btnText}>Aceptar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.btn, styles.btnNo, accionEnCurso === s.id && styles.disabled]}
                      onPress={() => handleRechazar(s.id)}
                      disabled={!!accionEnCurso}
                    >
                      <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
                    </Pressable>
                  </View>
                </View>
              </Container>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GlassWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { 
    fontSize: 32, 
    color: '#fff', 
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { 
    marginTop: 60, 
    alignItems: 'center',
    opacity: 0.8,
  },
  sub: { 
    marginTop: 16, 
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 138, 128, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 128, 0.2)',
  },
  errorText: { color: '#ff8a80', fontSize: 13, fontWeight: '500' },
  row: {
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: GlassSurface,
    borderWidth: 1,
    borderColor: GlassBorder,
    overflow: 'hidden',
  },
  rowContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowContentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  name: { color: '#fff', fontSize: 17, fontWeight: '700' },
  uid: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  actions: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: { 
    borderRadius: 14, 
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnOk: { 
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnNo: { 
    width: 38,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
