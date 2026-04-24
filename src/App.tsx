/**
 * ARCHIVO: App.tsx
 * DESCRIPCIÓN: Punto de entrada principal de la aplicación VeoVeo.
 * Se encarga de la configuración global, carga de fuentes, estilos web,
 * el escudo de versiones y la jerarquía de proveedores (Context Providers).
 */

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

// 🛑 CONFIGURACIÓN DE ACCESIBILIDAD: Cap global de escalado de fuentes
// Evita que configuraciones externas del sistema rompan los layouts de la app.
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

// Cliente para React Query (Gestión de estado asíncrono y caché)
const queryClient = new QueryClient();

function compareVersions(v1: string, v2: string) {
  const p1 = v1.split('.').map((value) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0);
  const p2 = v2.split('.').map((value) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0);

  for (let i = 0; i < Math.max(p1.length, p2.length); i += 1) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;

    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }

  return 0;
}

/**
 * COMPONENTE: VersionShield
 * PROPÓSITO: Detecta si existe una versión mínima requerida en Firebase
 * y bloquea la app si el usuario necesita actualizar.
 */
function VersionShield() {
  const [needsUpdate, setNeedsUpdate] = React.useState(false);
  
  // En Web no aplicamos bloqueo por versión nativa
  if (Platform.OS === 'web') return null;

  // Obtenemos metadatos de la compilación actual
  const currentBuild = Constants.expoConfig?.android?.versionCode ?? 0;
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  const isTest = Constants.expoConfig?.name?.includes('Test') ?? false;

  React.useEffect(() => {
    const db = getFirestoreDb();
    if (!db) return;

    // Escuchamos el documento de configuración global en Firebase 'configuracion/app'
    // Sincronizado automáticamente con el script push-version.mjs
    return onSnapshot(doc(db, 'configuracion', 'app'), (snap: any) => {
      if (snap.exists()) {
         const data = snap.data();
         // Elegimos el campo de versión mínima según si es build de test o producción
         const minVersionName = isTest ? data.min_version_test : data.min_version;
         
         // Si la versión actual es inferior a la requerida, activamos el escudo
         if (minVersionName && compareVersions(currentVersion, minVersionName) === -1) {
            setNeedsUpdate(true);
         }
      }
    });
  }, [currentVersion, isTest]);

  if (!needsUpdate) return null;

  // Interfaz de bloqueo por actualización obligatoria
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
                onPress={() => Linking.openURL('https://veoveo.dripdev.dev/descargar')} 
                style={styles.updateBtn}
             >
                Actualizar ahora
              </Text>
          </View>
       </View>
    </View>
  );
}

/**
 * COMPONENTE PRINCIPAL: App
 * Integra todos los proveedores de contexto y la navegación raíz.
 */
export default function App() {
  // Carga de fuentes icónicas necesarias para la UI
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  // EFECTO: Configuración Visual específica para WEB
  React.useEffect(() => {
    if (Platform.OS === 'web') {
       const head = document.head;
       
       // Inyección de Google Fonts (Montserrat) para una estética Premium
       const fontLink = document.createElement('link');
       fontLink.rel = 'stylesheet';
       fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap';
       head.appendChild(fontLink);

       // Polofill de fuentes de iconos para que se vean correctamente en el navegador
       const iconStyle = document.createElement('style');
       iconStyle.innerHTML = `
         @font-face {
           font-family: 'Ionicons';
           src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.3/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
           font-display: block;
         }
         @font-face {
           font-family: 'MaterialCommunityIcons';
           src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.3/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
           font-display: block;
         }
         @font-face {
           font-family: 'MaterialIcons';
           src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.3/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
           font-display: block;
         }
         [data-contents="true"], .rn-view, .rn-text {
           font-family: 'Montserrat', sans-serif;
         }
         [style*="font-family: Ionicons"], [style*="font-family: 'Ionicons'"], [data-icon] {
           font-family: 'Ionicons' !important;
         }
         [style*="font-family: MaterialCommunityIcons"], [style*="font-family: 'MaterialCommunityIcons'"] {
           font-family: 'MaterialCommunityIcons' !important;
         }
       `;
       head.appendChild(iconStyle);

       // Estilos globales de CSS para limpiar la UI web (scrollbars, backgrounds radiales)
       const style = document.createElement('style');
       style.innerHTML = `
         * {
           outline: none;
           -webkit-tap-highlight-color: transparent;
           user-select: none;
         }
         body {
           background-color: #020617;
           margin: 0;
           padding: 0;
           overflow-x: hidden;
           font-family: 'Montserrat', sans-serif !important;
         }
         /* Scrollbars elegantes estilo Apple */
         ::-webkit-scrollbar { width: 0px; height: 0px; background: transparent; }
         input, textarea { user-select: auto !important; }
         #root {
           background: radial-gradient(circle at center, #1e1b4b 0%, #020617 100%);
           height: 100dvh;
           position: fixed;
           top: 0; left: 0; right: 0; bottom: 0;
           overflow-y: auto;
         }
       `;
       head.appendChild(style);
    }
  }, []);

  // EFECTO: Listener de notificaciones para depuración
  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificación recibida:', notification);
    });

    return () => subscription.remove();
  }, []);

  // RENDER: Arbol de componentes con proveedores de contexto
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
            </View>
          </AuthProvider>
        </LanguageProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

// ESTILOS: Configuración visual global
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
  // Estilos visuales del escudo de actualización
  updateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  updateEmoji: { fontSize: 60, marginBottom: 20 },
  updateTitle: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  updateText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  updateBtnContainer: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  updateBtn: { backgroundColor: COLORS.primary, color: '#fff', paddingVertical: 18, textAlign: 'center', fontSize: 18, fontWeight: '800', borderRadius: 20 },
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
