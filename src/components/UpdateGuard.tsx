import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { getFirestoreDb } from '../services/firebase';
import { GradientBottom, AccentColor, Slate300, CardSurface } from '../theme/colors';

export function UpdateGuard({ children }: { children: React.ReactNode }) {
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  const [minVersion, setMinVersion] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('https://veoveo-app-install.netlify.app');

  const isTest = Constants.expoConfig?.name === 'VeoVeoTest' || Constants.expoConfig?.name === 'VeoVeo Test' || __DEV__;
  const lastNotifiedVersion = React.useRef<string | null>(null);

  useEffect(() => {
    console.log(`[UpdateGuard] Iniciando... App: ${Constants.expoConfig?.name}, Version: ${currentVersion}, Mode: ${isTest ? 'TEST' : 'PROD'}`);
    
    if (minVersion && compareVersions(currentVersion, minVersion) === -1) {
      if (lastNotifiedVersion.current !== minVersion) {
        lastNotifiedVersion.current = minVersion;
        void Notifications.scheduleNotificationAsync({
          content: {
            title: "🚀 ¡Nueva versión disponible!",
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
      console.warn('[UpdateGuard] No se pudo obtener la base de datos Firestore');
      setMinVersion('0.0.0'); // Desbloquear si no hay DB
      return;
    }

    const unsub = onSnapshot(doc(db, 'configuracion', 'app'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        
        // Handle possible trailing spaces in keys from manual entry
        const findValue = (prefix: string) => {
          const key = Object.keys(data).find(k => k.trim() === prefix);
          return key ? data[key] : null;
        };

        const mv = findValue(isTest ? 'min_version_test' : 'min_version');
        const du = findValue(isTest ? 'download_url_test' : 'download_url');
        
        console.log(`[UpdateGuard] Firestore sync: mv=${mv}, du=${du}`);

        if (mv) {
          setMinVersion(String(mv).trim());
        } else {
          setMinVersion('0.0.0'); // Fallback si el campo de test no existe aún
        }
        
        if (du) setDownloadUrl(String(du).trim());
      } else {
        console.warn('[UpdateGuard] El documento de configuración no existe');
        setMinVersion('0.0.0');
      }
    }, (error) => {
      console.error('Error en UpdateGuard snapshot:', error);
      setMinVersion('0.0.0'); // Desbloquear en error de permisos/red
    });
    return () => unsub();
  }, [isTest]);

  // Si aún no tenemos la versión mínima de Firestore, mostramos un cargando para evitar flickers
  if (!minVersion) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color={AccentColor} />
      </View>
    );
  }

  /**
   * Compara dos versiones semver (x.y.z)
   * @returns 1 si v1 > v2, -1 si v1 < v2, 0 si son iguales
   */
  const compareVersions = (v1: string, v2: string) => {
    const p1 = v1.split('.').map(v => parseInt(v.replace(/[^0-9]/g, ''), 10) || 0);
    const p2 = v2.split('.').map(v => parseInt(v.replace(/[^0-9]/g, ''), 10) || 0);
    
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  };

  const needsUpdate = compareVersions(currentVersion, minVersion) === -1;

  if (needsUpdate) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#020617', '#1e1b4b', '#020617']} style={StyleSheet.absoluteFill} />
        
        <View style={styles.content}>
          <BlurView intensity={40} tint="dark" style={styles.glassCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="rocket-outline" size={50} color={AccentColor} />
            </View>

            <Text style={styles.title}>Actualización Obligatoria</Text>
            
            <Text style={styles.subtitle}>
              Esta versión incluye cambios estructurales necesarios (Ajustes, Idiomas, Filtros persistentes) que requieren una instalación limpia del nuevo APK.
            </Text>

            <View style={styles.changelogBox}>
              <Text style={styles.changelogTitle}>¿Qué hay de nuevo?</Text>
              <Text style={styles.changelogItem}>• 🌐 Todas las plataformas de streaming disponibles</Text>
              <Text style={styles.changelogItem}>• 🔎 Buscador de servicios en Ajustes</Text>
              <Text style={styles.changelogItem}>• 🟢/🟠 Indicadores de Suscripción y Alquiler</Text>
              <Text style={styles.changelogItem}>• ⚡ Filtros de biblioteca dinámicos y rápidos</Text>
              <Text style={styles.changelogItem}>• 📱 Mejoras de diseño y rendimiento general</Text>
            </View>
            
            <View style={styles.badge}>
              <Text style={styles.versionInfo}>
                {isTest ? 'MODO TESTER' : 'MODO PRODUCCIÓN'} • Tu versión: {currentVersion}  →  Requerida: {minVersion}
              </Text>
            </View>
            
            <Pressable 
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
              onPress={() => Linking.openURL(downloadUrl)}
            >
              <LinearGradient 
                colors={[AccentColor, '#3b82f6']} 
                start={{x:0, y:0}} 
                end={{x:1, y:0}}
                style={styles.gradientBtn}
              >
                <Text style={styles.buttonText}>Descargar Nueva App (APK)</Text>
              </LinearGradient>
            </Pressable>
            
            <Text style={styles.note}>
              Al ser un cambio de núcleo nativo, las actualizaciones automáticas no bastan. ¡Instala el nuevo APK para seguir disfrutando!
            </Text>
          </BlurView>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#020617' },
  content: { padding: 30 },
  glassCard: { 
    borderRadius: 32, 
    padding: 24, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)'
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
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  changelogBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  changelogTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10, opacity: 0.9 },
  changelogItem: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 30,
  },
  versionInfo: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  button: { 
    borderRadius: 18,
    width: '100%',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: AccentColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  gradientBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  note: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 24, textAlign: 'center', lineHeight: 18 }
});
