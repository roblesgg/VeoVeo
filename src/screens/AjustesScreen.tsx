import { deleteUser } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getFirebaseAuth } from '../services/firebase';
import { GradientBackground } from '../components/GradientBackground';
import { BlurView } from 'expo-blur';
import { SHADOWS } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';
import { useMontserrat } from '../theme/useMontserrat';
import { useLanguage } from '../context/LanguageContext';
import * as preferences from '../storage/preferences';
import { useEffect } from 'react';
import { tmdbApi, posterUrl } from '../services/tmdbClient';
import { InputModal } from '../components/InputModal';

export interface Platform {
  id: number;
  name: string;
  color: string;
  logo_path: string;
}


export function AjustesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user, logout, linkGoogleAccount, unlinkGoogleAccount, changePassword, reauthenticate } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { fontFamily, loaded } = useMontserrat();
  const ff = fontFamily ?? 'System';
  const [busy, setBusy] = useState(false);
  const [adulto, setAdulto] = useState(false);
  const [misPlataformas, setMisPlataformas] = useState<number[]>([]);
  const [allPlataformas, setAllPlataformas] = useState<any[]>([]);
  const [busquedaPlataforma, setBusquedaPlataforma] = useState('');
  const [cargandoPlats, setCargandoPlats] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);


  useEffect(() => {
    console.log('--- AJUSTES MOUNTED ---');
    void preferences.cargarPreferenciaAdulto().then(setAdulto);
    void preferences.cargarPlataformas().then(res => {
      console.log('--- AJUSTES LOADED:', res);
      setMisPlataformas(res.map(Number));
    });

    void (async () => {
      setCargandoPlats(true);
      try {
        const res = await tmdbApi.obtenerProveedoresRegion('ES');
        // Sort alphabetically
        setAllPlataformas(res.results.sort((a: any, b: any) => a.provider_name.localeCompare(b.provider_name)));
      } catch (e) {
        console.error(e);
      } finally {
        setCargandoPlats(false);
      }
    })();
  }, []);

  const togglePlataforma = async (id: number) => {
    console.log('--- TOGGLING PLATFORM:', id);
    const next = misPlataformas.includes(id) 
      ? misPlataformas.filter(x => x !== id) 
      : [...misPlataformas, id];
    setMisPlataformas(next);
    await preferences.guardarPlataformas(next.map(String));
    if (user) {
      void require('../services/userPreferences').guardarPreferenciaFirestore(user.uid, 'plataformas', next);
    }
  };

  const eliminarCuenta = () => {
    Alert.prompt(
      t('delete_account'),
      t('confirm_delete'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async (password?: string) => {
            if (!password) return;
            const auth = getFirebaseAuth();
            const u = auth?.currentUser;
            if (!u) return;
            setBusy(true);
            try {
              await reauthenticate(password);
              await deleteUser(u);
              await logout();
            } catch (e) {
              Alert.alert(t('error'), t('reauth_failed'));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const cambiarPass = () => setShowPassModal(true);

  if (!loaded) {
    return <GradientBackground style={{ paddingTop: insets.top }} />;
  }

  return (
    <GradientBackground style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
            <BlurView intensity={50} tint="dark" style={styles.backBtnInner}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </BlurView>
          </Pressable>
          <Text style={[styles.titulo, { fontFamily: ff }]}>{t('settings')}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: Math.max(insets.top, 12) + 70 }}>
          {busy ? <ActivityIndicator color="#fff" style={{ marginBottom: 24 }} /> : null}

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={[styles.secLabel, { fontFamily: ff }]}>{t('account')}</Text>
            <BlurView intensity={20} tint="dark" style={styles.glassRow}>
              <Ionicons name="logo-google" size={24} color="#fff" style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { fontFamily: ff }]}>Google Cloud</Text>
                <Text style={[styles.rowSubtitle, { fontFamily: ff }]}>
                  {user?.providerData.some(p => p.providerId === 'google.com') 
                    ? t('linked') 
                    : t('not_linked')}
                </Text>
              </View>
              {user?.providerData.some(p => p.providerId === 'google.com') ? (
                <Pressable 
                  style={[styles.linkBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} 
                  onPress={async () => {
                    Alert.alert(
                      t('unlink'),
                      t('confirm_unlink'),
                      [
                        { text: t('cancel'), style: 'cancel' },
                        { 
                          text: t('unlink'), 
                          style: 'destructive',
                          onPress: async () => {
                            setBusy(true);
                            try {
                              await unlinkGoogleAccount();
                              Alert.alert(t('success'), 'OK');
                            } catch (e) {
                              Alert.alert(t('error'), 'Error');
                            } finally {
                              setBusy(false);
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={[styles.linkBtnText, { color: '#fff' }]}>{t('unlink')}</Text>
                </Pressable>
              ) : (
                <Pressable 
                  style={styles.linkBtn} 
                  onPress={async () => {
                    setBusy(true);
                    try {
                      await linkGoogleAccount();
                    } catch (e) {
                      Alert.alert(t('error'), 'Error');
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <Text style={[styles.linkBtnText, { fontFamily: ff }]}>{t('link')}</Text>
                </Pressable>
              )}
            </BlurView>

            <Pressable style={[styles.rowItem, { marginTop: 12 }]} onPress={cambiarPass}>
              <Ionicons name="key-outline" size={20} color="#fff" style={{ marginRight: 12 }} />
              <Text style={[styles.rowTitle, { fontFamily: ff, flex: 1 }]}>{t('change_password')}</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </Pressable>
          </View>

          {/* Streaming Platforms Section (Simplified) */}
          <View style={styles.section}>
            <Text style={[styles.secLabel, { fontFamily: ff }]}>{t('platforms')}</Text>
            
            <View style={styles.helpBox}>
              <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.6)" />
              <Text style={[styles.helpText, { fontFamily: ff }]}>
                Selecciona tus plataformas para ver un <Text style={{ color: '#2ecc71', fontWeight: '700' }}>punto verde</Text> si está incluida en tu suscripción, o <Text style={{ color: '#f39c12', fontWeight: '700' }}>naranja</Text> si es de alquiler.
              </Text>
            </View>

            <View style={styles.macList}>
              <TextInput 
                value={busquedaPlataforma}
                onChangeText={setBusquedaPlataforma}
                placeholder="Buscar plataforma..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.platSearch}
              />
              <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled>
                {cargandoPlats ? (
                  <ActivityIndicator color="#fff" style={{ margin: 20 }} />
                ) : (
                  allPlataformas
                    .filter(p => !busquedaPlataforma || p.provider_name.toLowerCase().includes(busquedaPlataforma.toLowerCase()))
                    .map((p, idx, arr) => (
                      <Pressable 
                        key={p.provider_id} 
                        onPress={() => togglePlataforma(p.provider_id)}
                        style={[
                          styles.macItem, 
                          idx === arr.length - 1 && { borderBottomWidth: 0 }
                        ]}
                      >
                        <Text style={[styles.macItemText, { fontFamily: ff }]}>{p.provider_name}</Text>
                        {misPlataformas.includes(p.provider_id) ? (
                          <Ionicons name="checkbox" size={24} color="#6C63FF" />
                        ) : (
                          <Ionicons name="square-outline" size={24} color="rgba(255,255,255,0.3)" />
                        )}
                      </Pressable>
                    ))
                )}
              </ScrollView>
            </View>
          </View>
          {/* Language Section */}
          <View style={styles.section}>
            <Text style={[styles.secLabel, { fontFamily: ff }]}>{t('language')}</Text>
            <View style={styles.rowItem}>
              <Ionicons name="language-outline" size={20} color="#fff" style={{ marginRight: 12 }} />
              <Text style={[styles.rowTitle, { fontFamily: ff, flex: 1 }]}>{language === 'es' ? 'Español' : 'English'}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={() => setLanguage('es')} style={[styles.langBtn, language === 'es' && styles.langBtnActive]}>
                  <Text style={styles.langBtnText}>ES</Text>
                </Pressable>
                <Pressable onPress={() => setLanguage('en')} style={[styles.langBtn, language === 'en' && styles.langBtnActive]}>
                  <Text style={styles.langBtnText}>EN</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Adult Content Switch */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.switchLabel, { fontFamily: ff }]}>{t('content_adult')}</Text>
              <Text style={[styles.switchDesc, { fontFamily: ff }]}>{t('content_adult_desc')}</Text>
            </View>
            <Pressable 
              onPress={async () => {
                const next = !adulto;
                setAdulto(next);
                await preferences.guardarPreferenciaAdulto(next);
              }}
              style={[styles.macSwitch, adulto && styles.macSwitchOn]}
            >
              <View style={[styles.macSwitchDot, adulto && styles.macSwitchDotOn]} />
            </Pressable>
          </View>

          {/* Delete Account Action */}
          <Pressable style={styles.danger} onPress={eliminarCuenta} disabled={busy}>
            <Text style={[styles.dangerText, { fontFamily: ff }]}>{t('delete_account')}</Text>
          </Pressable>

          {/* TMDB Footer */}
          <View style={styles.tmdbContainer}>
            <Image 
              source={{ uri: 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.png' }} 
              style={styles.tmdbLogo}
              resizeMode="contain"
            />
            <Text style={[styles.tmdbText, { fontFamily: ff }]}>
              Este producto utiliza la API de TMDB pero no está avalado ni certificado por TMDB.
            </Text>
          </View>

          <Text style={[styles.version, { fontFamily: ff }]}>v1.2.3 - Official</Text>
        </ScrollView>
      </View>

      <InputModal
        visible={showPassModal}
        title={t('change_password')}
        placeholder={t('enter_password')}
        fontFamily={ff}
        onClose={() => setShowPassModal(false)}
        onConfirm={async (newPass) => {
          setShowPassModal(false);
          if (!newPass) return;
          setBusy(true);
          try {
            await changePassword(newPass);
            Alert.alert(t('success'), t('password_changed'));
          } catch (e) {
            Alert.alert(t('error'), e instanceof Error ? e.message : 'Error');
          } finally {
            setBusy(false);
          }
        }}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  titulo: { 
    fontSize: 28, 
    color: '#fff', 
    fontWeight: '700', 
    lineHeight: 34,
  },
  headerRow: {
    position: 'absolute',
    left: 20,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    gap: 12
  },
  backBtnHeader: {
    width: 44,
    height: 44,
  },
  danger: {
    marginTop: 24,
    backgroundColor: 'rgba(255,80,80,0.15)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  dangerText: { color: '#ff8a80', fontWeight: '600', fontSize: 16 },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 4,
    zIndex: 10,
  },
  backBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  langBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  langBtnActive: { backgroundColor: '#fff' },
  langBtnText: { color: '#888', fontWeight: '700', fontSize: 12 },
  langBtnActiveText: { color: '#000' },
  version: { 
    color: 'rgba(255,255,255,0.15)', 
    textAlign: 'center', 
    marginTop: 40, 
    fontSize: 12 
  },
  tmdbContainer: {
    marginTop: 40,
    alignItems: 'center',
    opacity: 0.6,
  },
  tmdbLogo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  tmdbText: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  switchLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  macSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 2,
    justifyContent: 'center',
  },
  macSwitchOn: { backgroundColor: '#34c759' },
  macSwitchDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  macSwitchDotOn: { alignSelf: 'flex-end' },
  section: { marginTop: 32 },
  secLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  rowItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16 },
  rowTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rowSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  glassRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 16, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  linkBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  linkBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  macList: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 16, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  macItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.05)' 
  },
  macItemText: { color: '#fff', fontSize: 16, flex: 1, fontWeight: '500' },
  helpBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  helpText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 18,
    flex: 1
  },
  platSearch: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    fontSize: 15
  }
});
