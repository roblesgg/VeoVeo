import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { GradientBackground } from '../components/GradientBackground';
import { useMontserrat } from '../theme/useMontserrat';
import { SHADOWS } from '../theme/theme';
import { sendEmailVerification } from 'firebase/auth';

export function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const { user, refreshUser, logout } = useAuth();
  const { fontFamily, loaded } = useMontserrat();
  const ff = fontFamily || 'System';

  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const onCheckStatus = async () => {
    setCargando(true);
    setError(null);
    try {
      await refreshUser();
    } catch (err) {
      setError('Error al refrescar estado.');
    } finally {
      setCargando(false);
    }
  };

  const onResendEmail = async () => {
    if (!user) return;
    setReenviando(true);
    setMensaje(null);
    try {
      await sendEmailVerification(user);
      setMensaje('Correo enviado. Revisa tu bandeja de entrada o spam.');
    } catch (err) {
      setError('Demasiados intentos. Inténtalo más tarde.');
    } finally {
      setReenviando(false);
    }
  };

  if (!loaded) return null;

  return (
    <GradientBackground style={[styles.center, { paddingTop: insets.top }]}>
      <View style={styles.pad}>
        <View style={[styles.iconBox, SHADOWS.mac]}>
          <Ionicons name="mail-unread" size={60} color="#fff" />
        </View>

        <Text style={[styles.title, { fontFamily: ff }]}>Verifica tu correo</Text>
        <Text style={[styles.desc, { fontFamily: ff }]}>
          Hemos enviado un enlace de confirmación a:{"\n"}
          <Text style={styles.emailText}>{user?.email}</Text>
        </Text>

        <View style={styles.card}>
          <BlurView intensity={20} tint="dark" style={styles.cardInner}>
            <Text style={[styles.info, { fontFamily: ff }]}>
              Una vez que hayas pulsado el enlace en el correo, dale al botón de abajo:
            </Text>

            <Pressable 
              style={[styles.mainBtn, SHADOWS.macLight]} 
              onPress={onCheckStatus}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.mainBtnText, { fontFamily: ff }]}>YA LO HE VERIFICADO</Text>
              )}
            </Pressable>

            {mensaje && <Text style={[styles.msg, { fontFamily: ff }]}>{mensaje}</Text>}
            {error && <Text style={[styles.err, { fontFamily: ff }]}>{error}</Text>}
          </BlurView>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={onResendEmail} disabled={reenviando}>
            <Text style={[styles.link, { fontFamily: ff, opacity: reenviando ? 0.5 : 1 }]}>
              {reenviando ? 'Enviando...' : 'Reenviar código de verificación'}
            </Text>
          </Pressable>

          <Pressable onPress={logout} style={{ marginTop: 24 }}>
            <View style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.4)" />
              <Text style={[styles.logoutText, { fontFamily: ff }]}>Cerrar sesión</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  pad: { paddingHorizontal: 30, alignItems: 'center' },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  emailText: { color: '#fff', fontWeight: '800' },
  card: { width: '100%', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardInner: { padding: 24, alignItems: 'center' },
  info: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  mainBtn: {
    backgroundColor: '#fff',
    height: 52,
    borderRadius: 26,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  msg: { color: '#7CFC9A', marginTop: 16, textAlign: 'center', fontSize: 13 },
  err: { color: '#ff8a80', marginTop: 16, textAlign: 'center', fontSize: 13 },
  footer: { marginTop: 40, alignItems: 'center' },
  link: { color: '#fff', fontSize: 14, textDecorationLine: 'underline' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoutText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
});
