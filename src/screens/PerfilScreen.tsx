import React, { useState } from 'react';
import { 
  ActivityIndicator, Image, Pressable, ScrollView, 
  StyleSheet, Text, View, Share 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useMontserrat } from '../theme/useMontserrat';
import { useLanguage } from '../context/LanguageContext';
import { GradientBackground } from '../components/GradientBackground';
import { SHADOWS } from '../theme/theme';
import { AccentBorder } from '../theme/colors';

// Hooks
import { useUserProfile } from '../hooks/profile/useUserProfile';

// Modular Components
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileOptions } from '../components/profile/ProfileOptions';
import { UsernameModal, AvatarModal } from '../components/profile/ProfileModals';

export function PerfilScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { fontFamily: ff } = useMontserrat();
  const { t } = useLanguage();
  const fontFamily = ff || 'System';

  const { 
    usuario, cargando, stats, error, mensaje, 
    handleUpdateUsername, handleUpdateAvatar, recargar 
  } = useUserProfile();

  const [showUserModal, setShowUserModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  if (cargando && !usuario) {
    return (
      <GradientBackground style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </GradientBackground>
    );
  }

  if (!usuario) {
    return (
      <GradientBackground style={styles.center}>
        <Text style={styles.errText}>{error || 'Error al cargar perfil'}</Text>
        <Pressable style={styles.retryBtn} onPress={recargar}>
          <Text style={{ color: '#fff', fontFamily }}>Reintentar</Text>
        </Pressable>
      </GradientBackground>
    );
  }

  const fotoUri = usuario.fotoPerfil ?? user?.photoURL ?? null;

  return (
    <GradientBackground style={styles.flex}>
      <Pressable onPress={() => navigation.goBack()} style={[styles.backBtn, { top: Math.max(insets.top, 12) + 8 }]}>
        <BlurView intensity={50} tint="dark" style={styles.backBtnInner}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </BlurView>
      </Pressable>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60, paddingBottom: 40 }]}>
        <Pressable style={[styles.avatarWrap, SHADOWS.mac]} onPress={() => setShowAvatarModal(true)}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color="rgba(255,255,255,0.85)" />
            </View>
          )}
          <View style={styles.cameraBtn}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </Pressable>

        <Pressable style={styles.nameRow} onPress={() => setShowUserModal(true)}>
          <Text style={[styles.nameText, { fontFamily }]}>{usuario.username}</Text>
          <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <ProfileStats vistas={stats.vistas} porVer={stats.porVer} resenas={stats.resenas} fontFamily={fontFamily} />

        <ProfileOptions 
          onAjustes={() => navigation.navigate('Ajustes')}
          onBloqueados={() => navigation.navigate('Bloqueados')}
          onLogout={logout}
          fontFamily={fontFamily}
        />

        <Pressable 
          style={styles.shareBtn} 
          onPress={() => Share.share({ message: `${t('share_msg')} https://veoveo-app-install.netlify.app` })}
        >
          <Ionicons name="share-social-outline" size={22} color="#fff" />
          <Text style={[styles.shareText, { fontFamily }]}>{t('share_app')}</Text>
        </Pressable>

        {error && <Text style={styles.feedbackErr}>{error}</Text>}
        {mensaje && <Text style={styles.feedbackOk}>{mensaje}</Text>}
      </ScrollView>

      <UsernameModal 
        visible={showUserModal} 
        initialValue={usuario.username} 
        onClose={() => setShowUserModal(false)}
        onSave={handleUpdateUsername}
        fontFamily={fontFamily}
      />

      <AvatarModal 
        visible={showAvatarModal} 
        initialValue={fotoUri || ''} 
        onClose={() => setShowAvatarModal(false)}
        onSave={handleUpdateAvatar}
        fontFamily={fontFamily}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 24, alignItems: 'center' },
  backBtn: { position: 'absolute', left: 20, zIndex: 10 },
  backBtnInner: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', overflow: 'hidden' },
  avatarWrap: { marginBottom: 16 },
  avatarImg: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: { backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  cameraBtn: { position: 'absolute', bottom: -4, right: -4, backgroundColor: AccentBorder, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1A1A2E' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  nameText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  feedbackErr: { color: '#ff8a80', marginTop: 16 },
  feedbackOk: { color: '#4CAF50', marginTop: 16 },
  errText: { color: '#ff8a80', textAlign: 'center', fontSize: 16 },
  retryBtn: { marginTop: 16, backgroundColor: AccentBorder, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shareBtn: { 
    marginTop: 32, 
    backgroundColor: 'rgba(255,255,255,0.06)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12, 
    width: '100%',
    height: 56, 
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden'
  },
  shareText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
