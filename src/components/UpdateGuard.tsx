/**
 * ARCHIVO: components/UpdateGuard.tsx
 * DESCRIPCIÓN: Escudo de versión obligatoria.
 * Monitoriza en tiempo real (vía Firestore snapshot) la versión mínima requerida.
 * Si la versión instalada es inferior, bloquea la app y fuerza la descarga del nuevo APK.
 * Soporta modos diferenciados para 'Test' (Testers) y 'Producción' (Usuarios finales).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { getFirestoreDb } from '../services/firebase';
import { AccentColor } from '../theme/colors';
import { useMontserrat } from '../theme/useMontserrat';

export function UpdateGuard({ children }: { children: React.ReactNode }) {
  const { fontFamily } = useMontserrat();
  const ff = fontFamily ?? 'System';
  
  // Versión definida en app.json / expo.version
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  
  const [minVersion, setMinVersion] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('https://dripdev.dev');

  // Determina si estamos en una build de test o desarrollo
  const isTest =
    Constants.expoConfig?.name === 'VeoVeoTest' ||
    Constants.expoConfig?.name === 'VeoVeo Test' ||
    __DEV__;
    
  const lastNotifiedVersion = React.useRef<string | null>(null);

  useEffect(() => {
    /** 🔔 NOTIFICACIÓN LOCAL:
     * Si detectamos que hay una versión superior, enviamos una notificación
     * push local inmediata para avisar al usuario incluso si está navegando.
     */
    if (minVersion && compareVersions(currentVersion, minVersion) === -1) {
      if (lastNotifiedVersion.current !== minVersion) {
        lastNotifiedVersion.current = minVersion;
        void Notifications.scheduleNotificationAsync({
          content: {
            title: '🚀 ¡Nueva versión disponible!',
            body: `La versión ${minVersion} ya está lista. Instálala para no perderte nada.`,
            data: { url: downloadUrl },
          },
          trigger: null,
        });
      }
    }
  }, [minVersion, currentVersion, downloadUrl]);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!db) {
      setMinVersion('0.0.0'); // Desbloquear si falla Firebase para evitar brickeo
      return;
    }

    /** 🔥 SUSCRIPCIÓN TIEMPO REAL:
     * Escuchamos el documento 'configuracion/app' en Firestore.
     * Esto permite forzar la actualización de todos los usuarios
     * en segundos sin necesidad de republicar en tiendas.
     */
    const unsub = onSnapshot(
      doc(db, 'configuracion', 'app'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          
          // Helper para saneado de claves (protección contra espacios accidentales en consola)
          const findValue = (prefix: string) => {
            const key = Object.keys(data).find((k) => k.trim() === prefix);
            return key ? data[key] : null;
          };

          // Leemos campos específicos según el canal (Test vs Prod)
          const mv = findValue(isTest ? 'min_version_test' : 'min_version');
          const du = findValue(isTest ? 'download_url_test' : 'download_url');

          if (mv) setMinVersion(String(mv).trim());
          else setMinVersion('0.0.0');

          if (du) setDownloadUrl(String(du).trim());
        } else {
          setMinVersion('0.0.0');
        }
      },
      (error) => {
        setMinVersion('0.0.0');
      },
    );
    return () => unsub();
  }, [isTest]);

  // Pantalla de carga inicial mientras sincroniza versiones
  if (!minVersion) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={AccentColor} />
      </View>
    );
  }

  /**
   * Compara dos cadenas de versión semver (ej: "1.5.0" vs "1.5.2")
   * @returns 1 si v1 > v2, -1 si v1 < v2, 0 si son iguales
   */
  const compareVersions = (v1: string, v2: string) => {
    const p1 = v1.split('.').map((v) => parseInt(v.replace(/[^0-9]/g, ''), 10) || 0);
    const p2 = v2.split('.').map((v) => parseInt(v.replace(/[^0-9]/g, ''), 10) || 0);

    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  };

  const needsUpdate = compareVersions(currentVersion, minVersion) === -1;

  // Renderizado bloqueante si se requiere actualización
  if (needsUpdate) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#020617', '#1e1b4b', '#020617']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          <BlurView intensity={40} tint="dark" style={styles.glassCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="rocket-outline" size={50} color={AccentColor} />
            </View>

            <Text style={[styles.title, { fontFamily: ff }]}>Actualización Obligatoria</Text>

            <Text style={[styles.subtitle, { fontFamily: ff }]}>
              Esta versión incluye cambios estructurales necesarios que requieren 
              una instalación limpia del nuevo APK.
            </Text>

            {/* Listado manual de novedades para motivar al usuario */}
            <View style={styles.changelogBox}>
              <Text style={[styles.changelogTitle, { fontFamily: ff }]}>¿Qué hay de nuevo?</Text>
              <Text style={[styles.changelogItem, { fontFamily: ff }]}>• 🌐 Streaming completo (ES)</Text>
              <Text style={[styles.changelogItem, { fontFamily: ff }]}>• 🔎 Mejoras en el buscador</Text>
              <Text style={[styles.changelogItem, { fontFamily: ff }]}>• ⚡ Rendimiento optimizado</Text>
            </View>

            <View style={styles.badge}>
              <Text style={[styles.versionInfo, { fontFamily: ff }]}>
                {isTest ? 'MODO TESTER' : 'MODO PRODUCCIÓN'} • v{currentVersion} → v{minVersion}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
              onPress={() => Linking.openURL(downloadUrl)}
            >
              <LinearGradient
                colors={[AccentColor, '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <Text style={[styles.buttonText, { fontFamily: ff }]}>Descargar (APK)</Text>
              </LinearGradient>
            </Pressable>
          </BlurView>
        </View>
      </View>
    );
  }

  // Si la versión es correcta, renderiza el resto de la App (Provider HOC)
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#020617' },
  content: { padding: 30 },
  glassCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { color: '#fff', fontSize: 26, marginBottom: 12, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  changelogBox: { width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 16, marginBottom: 20 },
  changelogTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  changelogItem: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
  versionInfo: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  button: { borderRadius: 18, width: '100%', overflow: 'hidden' },
  gradientBtn: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
