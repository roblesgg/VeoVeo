import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidBottomBar } from '../components/LiquidBottomBar';
import type { RootStackParamList } from '../navigation/types';
import { GradientBottom, GradientTop } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { obtenerPerfilUsuario } from '../services/repositorioUsuarios';
import { useMontserrat } from '../theme/useMontserrat';
import { SplashView } from '../components/SplashView';
import { BibliotecaTab } from './BibliotecaTab';
import { DiscoverTab } from './DiscoverTab';
import { SocialTab } from './SocialTab';
import { TierListsTab } from './TierListsTab';

export function MainScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { fontFamily, loaded } = useMontserrat();

  const [paginaActual, setPaginaActual] = useState(0);
  const [pantallaTierList, setPantallaTierList] = useState(0);
  const [appReady, setAppReady] = useState(false);

  const isFocused = useIsFocused();
  const [userProfile, setUserProfile] = useState<{ fotoPerfil?: string | null }>({});

  useEffect(() => {
    if (isFocused && user) {
      void (async () => {
        const p = await obtenerPerfilUsuario();
        if (p) setUserProfile(p);
      })();
    }
  }, [isFocused, user]);

  // Bypass for Splash: Force ready after 3.5s even if fonts fail
  useEffect(() => {
    if (Platform.OS === 'web') {
      const emergencyTimer = setTimeout(() => setAppReady(true), 3500);
      return () => clearTimeout(emergencyTimer);
    }
  }, []);

  // Simulate minimal loading time for Splash
  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => setAppReady(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  const [resetToken, setResetToken] = useState(0);
  const ff = useMemo(() => fontFamily ?? 'System', [fontFamily]);

  const handleTabPress = (index: number) => {
    if (paginaActual === index) {
      setResetToken((prev) => prev + 1);
    } else {
      setPaginaActual(index);
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    const onBackPress = () => {
      if (paginaActual === 2 && pantallaTierList !== 0) {
        setPantallaTierList(pantallaTierList === 1 || pantallaTierList === 2 ? 0 : 1);
        return true;
      }
      if (paginaActual !== 0) {
        setPaginaActual(0);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isFocused, paginaActual, pantallaTierList]);

  if (!appReady) return <SplashView fontFamily={ff} />;

  const showBottomBar = !(paginaActual === 2 && pantallaTierList !== 0);

  const navigatePelicula = (id: number) => {
    navigation.navigate('Pelicula', { movieId: id });
  };

  const navigateActor = (id: number, name: string) => {
    navigation.navigate('Actor', { actorId: id, actorName: name });
  };

  return (
    <LinearGradient colors={[GradientTop, GradientBottom]} style={styles.flex}>
      <View style={styles.flex}>
        {paginaActual === 0 ? (
          <DiscoverTab
            fontFamily={ff}
            estaActiva
            resetToken={resetToken}
            onPeliculaClick={navigatePelicula}
            onActorClick={navigateActor}
            onPerfilClick={() => navigation.navigate('Perfil')}
            userFoto={userProfile?.fotoPerfil || user?.photoURL}
          />
        ) : null}

        {paginaActual === 1 ? (
          <BibliotecaTab
            fontFamily={ff}
            resetToken={resetToken}
            onPeliculaClick={navigatePelicula}
            onPerfilClick={() => navigation.navigate('Perfil')}
            userFoto={userProfile?.fotoPerfil || user?.photoURL}
          />
        ) : null}

        {paginaActual === 2 ? (
          <TierListsTab
            fontFamily={ff}
            pantalla={pantallaTierList}
            onPantallaChange={setPantallaTierList}
            onPeliculaClick={navigatePelicula}
            onPerfilClick={() => navigation.navigate('Perfil')}
            userFoto={userProfile?.fotoPerfil || user?.photoURL}
          />
        ) : null}

        {paginaActual === 3 ? (
          <SocialTab
            fontFamily={ff}
            onUsuarioClick={(uid) => {
              navigation.navigate('BibliotecaAmigo', { amigoUid: uid });
            }}
            onSolicitudesClick={() => navigation.navigate('Solicitudes')}
            onChatClick={(chatId, participants, chatName) => navigation.navigate('ChatDetail', { chatId, participants, chatName })}
            onPerfilClick={() => navigation.navigate('Perfil')}
            userFoto={userProfile?.fotoPerfil || user?.photoURL}
          />
        ) : null}
      </View>

      {showBottomBar ? (
        <LiquidBottomBar onTabChange={handleTabPress} paginaActual={paginaActual} />
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
