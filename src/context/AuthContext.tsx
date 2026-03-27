import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  signInWithEmailAndPassword,
  signOut,
  type User,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
  unlink,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { AppState, type AppStateStatus } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirebaseAuth } from '../services/firebase';
import { actualizarEstadoConexion } from '../services/repositorioUsuarios';

// WebBrowser.maybeCompleteAuthSession(); No longer needed with native Google Sign-In

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (password: string) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getFirebaseAuth();
  const firebaseReady = auth != null;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        void actualizarEstadoConexion('online');
        void require('../services/userPreferences').sincronizarPreferenciasConFirestore(u.uid);
      }
    });
    return unsub;
  }, [auth]);

  useEffect(() => {
    if (!user) return;

    const handleStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void actualizarEstadoConexion('online');
      } else if (nextState === 'background' || nextState === 'inactive') {
        void actualizarEstadoConexion('ausente');
      }
    };

    const sub = AppState.addEventListener('change', handleStateChange);
    return () => sub.remove();
  }, [user]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!auth) throw new Error('Firebase no configurado (variables EXPO_PUBLIC_FIREBASE_*).');
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    [auth]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      if (!auth) throw new Error('Firebase no configurado (variables EXPO_PUBLIC_FIREBASE_*).');
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Enviar verificación inmediatamente
      await sendEmailVerification(cred.user);
    },
    [auth]
  );

  const refreshUser = useCallback(async () => {
    if (!auth?.currentUser) return;
    await reload(auth.currentUser);
    setUser({ ...auth.currentUser });
  }, [auth]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!auth) throw new Error('Firebase no configurado.');
      await sendPasswordResetEmail(auth, email.trim());
    },
    [auth]
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken || !auth) return;
      
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }, [auth]);

  const linkGoogleAccount = useCallback(async () => {
    if (!auth?.currentUser) return;
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) return;

      const credential = GoogleAuthProvider.credential(idToken);
      await linkWithCredential(auth.currentUser, credential);
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error('Google Link Error:', error);
      throw error;
    }
  }, [auth]);

  const unlinkGoogleAccount = useCallback(async () => {
    if (!auth?.currentUser) return;
    try {
      await unlink(auth.currentUser, 'google.com');
      await GoogleSignin.signOut();
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error('Google Unlink Error:', error);
      throw error;
    }
  }, [auth]);

  const changePassword = useCallback(async (newPassword: string) => {
    if (!auth?.currentUser) return;
    await updatePassword(auth.currentUser, newPassword);
  }, [auth]);

  const reauthenticate = useCallback(async (password: string) => {
    if (!auth?.currentUser || !auth.currentUser.email) return;
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
  }, [auth]);

  const logout = useCallback(async () => {
    if (!auth) return;
    try {
      await actualizarEstadoConexion('offline');
    } catch {
      // Ignorar si falla al cerrar sesión
    }
    await signOut(auth);
  }, [auth]);

  const value = useMemo(
    () => ({ 
      user, loading, firebaseReady, login, signInWithGoogle, 
      linkGoogleAccount, unlinkGoogleAccount, register, logout, 
      refreshUser, resetPassword, changePassword, reauthenticate 
    }),
    [
      user, loading, firebaseReady, login, signInWithGoogle, 
      linkGoogleAccount, unlinkGoogleAccount, register, logout, 
      refreshUser, resetPassword, changePassword, reauthenticate
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
