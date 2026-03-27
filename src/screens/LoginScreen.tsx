import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { GradientBackground } from '../components/GradientBackground';
import type { RootStackParamList } from '../navigation/types';
import { AccentBorder, ErrorRed } from '../theme/colors';
import { SHADOWS } from '../theme/theme';
import { useMontserrat } from '../theme/useMontserrat';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { login, signInWithGoogle, firebaseReady, resetPassword } = useAuth();
  const { fontFamily, loaded } = useMontserrat();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const ff = fontFamily ?? 'System';

  if (!loaded) {
    return <GradientBackground style={{ paddingTop: insets.top }} />;
  }

  return (
    <GradientBackground style={[styles.center, { paddingTop: insets.top }]}>
      <View style={styles.pad}>
        <Text style={[styles.logo, { fontFamily: ff }]}>VeoVeo</Text>

        {!firebaseReady ? (
          <Text style={styles.warn}>
            Configura las variables EXPO_PUBLIC_FIREBASE_* en un archivo .env (mismo proyecto Firebase
            que el Android).
          </Text>
        ) : null}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#888"
          underlineColorAndroid="transparent"
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, SHADOWS.macLight, { fontFamily: ff }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          underlineColorAndroid="transparent"
          secureTextEntry
          style={[styles.input, SHADOWS.macLight, { fontFamily: ff }]}
        />

        {errorMessage ? <Text style={[styles.err, { fontFamily: ff }]}>{errorMessage}</Text> : null}

        {loading ? <ActivityIndicator color="#fff" style={{ marginBottom: 16 }} /> : null}

        <Pressable
          style={[styles.btn, styles.btnDark, SHADOWS.macLight]}
          disabled={loading || !firebaseReady}
          onPress={async () => {
            setErrorMessage('');
            setLoading(true);
            try {
              await login(email, password);
            } catch (e) {
              setErrorMessage(e instanceof Error ? e.message : 'Error al iniciar sesión');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={[styles.btnText, { fontFamily: ff }]}>INICIAR SESIÓN</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.btnLight, SHADOWS.macLight]}
          disabled={loading || !firebaseReady}
          onPress={async () => {
            setErrorMessage('');
            setLoading(true);
            try {
              await signInWithGoogle();
            } catch (e) {
              setErrorMessage(e instanceof Error ? e.message : 'Error con Google');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Ionicons name="logo-google" size={20} color="#000" style={{ marginRight: 8 }} />
          <Text style={[styles.btnTextDark, { fontFamily: ff }]}>Continuar con Google</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }}>
          <Text style={[styles.link, { fontFamily: ff }]}>¿No tienes cuenta? Regístrate</Text>
        </Pressable>

        <Pressable 
          onPress={async () => {
            if (!email.trim()) {
              Alert.alert('Restablecer contraseña', 'Por favor, introduce tu email arriba primero.');
              return;
            }
            try {
              setLoading(true);
              await resetPassword(email);
              Alert.alert('Éxito', 'Se ha enviado un correo para restablecer tu contraseña.');
            } catch (e) {
              setErrorMessage(e instanceof Error ? e.message : 'Error al enviar correo');
            } finally {
              setLoading(false);
            }
          }} 
          style={{ marginTop: 12 }}
        >
          <Text style={[styles.link, { fontFamily: ff, opacity: 0.7, fontSize: 13 }]}>¿Has olvidado tu contraseña?</Text>
        </Pressable>

        <Text style={[styles.version, { fontFamily: ff }]}>v1.2.2 - Official</Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  pad: { paddingHorizontal: 32 },
  logo: { fontSize: 48, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 40 },
  warn: { color: '#ffcc80', marginBottom: 16, textAlign: 'center', fontSize: 13 },
  input: {
    borderRadius: 24,
    backgroundColor: '#1e1e2d',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    height: 52,
    color: '#fff',
    marginBottom: 16,
  },
  err: { color: ErrorRed, marginBottom: 16, textAlign: 'center', fontSize: 14 },
  btn: {
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnDark: { backgroundColor: '#000' },
  btnLight: { backgroundColor: '#fff' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextDark: { color: '#000', fontWeight: '700' },
  link: { color: '#fff', textAlign: 'center' },
  version: { color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 32, fontSize: 12 },
});
