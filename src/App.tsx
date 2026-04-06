import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Linking, StyleSheet, Text, View, TextInput } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import Constants from 'expo-constants';
import { BlurView } from 'expo-blur';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { RootNavigator } from './navigation/RootNavigator';
import { COLORS } from './theme/colors';
import { getFirestoreDb } from './services/firebase';

// 🛑 Cap global de escalado de fuentes para evitar layouts rotos
if ((Text as any).defaultProps) {
  (Text as any).defaultProps.maxFontSizeMultiplier = 1.3;
} else {
  (Text as any).defaultProps = { maxFontSizeMultiplier: 1.3 };
}
if ((TextInput as any).defaultProps) {
  (TextInput as any).defaultProps.maxFontSizeMultiplier = 1.3;
} else {
  (TextInput as any).defaultProps = { maxFontSizeMultiplier: 1.3 };
}

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

const queryClient = new QueryClient();

// 🛡️ Escudo de Versión: Detecta si el usuario necesita actualizar
function VersionShield() {
  const [needsUpdate, setNeedsUpdate] = React.useState(false);
  
  if (Platform.OS === 'web') return null;

  const currentBuild = Constants.expoConfig?.android?.versionCode ?? 0;
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  const isTest = Constants.expoConfig?.name?.includes('Test') ?? false;

  React.useEffect(() => {
    const db = getFirestoreDb();
    if (!db) return;

    // Escuchamos el documento de configuración global en Firebase
    // Nota: Sincronizado con el script push-version.mjs
    return onSnapshot(doc(db, 'configuracion', 'app'), (snap: any) => {
      if (snap.exists()) {
         const data = snap.data();
         const minVersionName = isTest ? data.min_version_test : data.min_version;
         
         if (minVersionName && currentVersion < minVersionName) {
            setNeedsUpdate(true);
         }
      }
    });
  }, [currentVersion, isTest]);

  if (!needsUpdate) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
       <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
       <View style={styles.updateContainer}>
          <Text style={styles.updateEmoji}>🚀</Text>
          <Text style={styles.updateTitle}>Nueva versión disponible</Text>
          <Text style={styles.updateText}>
            Hemos lanzado mejoras críticas. Actualiza ahora para seguir disfrutando de VeoVeo en la versión más reciente.
          </Text>
          <View style={styles.updateBtnContainer}>
             <Text 
                onPress={() => Linking.openURL('https://veoveo.dripdev.dev')} 
                style={styles.updateBtn}
             >
                Actualizar ahora
             </Text>
          </View>
       </View>
    </View>
  );
}

// 📱 Botón flotante para descargar la App (Solo Web)
function FloatingDownloadButton() {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.fabContainer}>
      <Text 
        onPress={() => Linking.openURL('/descargar')} 
        style={styles.fab}
      >
        📲 Descargar App
      </Text>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  React.useEffect(() => {
    if (Platform.OS === 'web') {
       // Inyectar Google Fonts (Montserrat)
       const fontLink = document.createElement('link');
       fontLink.rel = 'stylesheet';
       fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap';
       document.head.appendChild(fontLink);

       // Inyectar Ionicons (v4+ para nombres modernos)
       const iconLink = document.createElement('link');
       iconLink.rel = 'stylesheet';
       iconLink.href = 'https://code.ionicframework.com/ionicons/4.5.10-0/css/ionicons.min.css';
       document.head.appendChild(iconLink);
    }
  }, []);

  React.useEffect(() => {
    // Listener para notificaciones en primer plano
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificación recibida:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LanguageProvider>
          <AuthProvider>
            <View style={styles.appWrapper}>
               <View style={styles.mainContainer}>
                  <RootNavigator />
                  <VersionShield />
               </View>
               <FloatingDownloadButton />
            </View>
          </AuthProvider>
        </LanguageProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  debugScreen: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  debugTitle: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
  },
  debugText: {
    color: '#cbd5e1',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Estilos del escudo de actualización
  updateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  updateEmoji: { fontSize: 60, marginBottom: 20 },
  updateTitle: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  updateText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  updateBtnContainer: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  updateBtn: { backgroundColor: COLORS.primary, color: '#fff', paddingVertical: 18, textAlign: 'center', fontSize: 18, fontWeight: '800', borderRadius: 20 },
  // Estilos del FAB (Botón flotante)
  fabContainer: {
    position: 'absolute',
    top: 20,
    right: 30,
    zIndex: 9999,
  },
  fab: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    color: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    fontSize: 14,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
    // Glassmorphism effect for web
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(10px)',
      cursor: 'pointer',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    } : {}),
  },
  appWrapper: {
    flex: 1,
    backgroundColor: '#020617',
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)',
    } : {}),
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
});
