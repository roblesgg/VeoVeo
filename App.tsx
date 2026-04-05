import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerRootComponent } from 'expo';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import Constants from 'expo-constants';
import { BlurView } from 'expo-blur';

import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/theme/colors';

const queryClient = new QueryClient();

// 🛡️ Escudo de Versión: Detecta si el usuario necesita actualizar
function VersionShield() {
  const [needsUpdate, setNeedsUpdate] = React.useState(false);
  const currentVersion = Constants.expoConfig?.version || '1.0.0';

  React.useEffect(() => {
    const db = getFirestore();
    // Escuchamos el documento de configuración global en Firebase
    return onSnapshot(doc(db, 'config', 'app_meta'), (snap) => {
      if (snap.exists()) {
         const { minVersion } = snap.data();
         // Si la versión mínima en Firebase es mayor que la actual, bloqueamos
         if (minVersion && currentVersion < minVersion) {
            setNeedsUpdate(true);
         }
      }
    });
  }, []);

  if (!needsUpdate) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
       <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
       <View style={styles.updateContainer}>
          <Text style={styles.updateEmoji}>🚀</Text>
          <Text style={styles.updateTitle}>Nueva versión disponible</Text>
          <Text style={styles.updateText}>
            Hemos lanzado mejoras críticas en esta versión (v1.5.0). Actualiza ahora para seguir disfrutando de VeoVeo.
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LanguageProvider>
          <AuthProvider>
            <View style={{ flex: 1 }}>
              <RootNavigator />
              <VersionShield />
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
});
