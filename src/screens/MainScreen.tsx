import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidBottomBar } from '../components/LiquidBottomBar';
import type { RootStackParamList } from '../navigation/types';
import { GradientBottom, GradientTop } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { obtenerPerfilUsuario } from '../services/repositorioUsuarios';
import { eliminarAmigo, bloquearUsuario } from '../services/repositorioSocial';
import { useMontserrat } from '../theme/useMontserrat';
import { SplashView } from '../components/SplashView';
import { BibliotecaAmigoScreen } from './BibliotecaAmigoScreen';
import { BibliotecaTab } from './BibliotecaTab';
import { DiscoverTab } from './DiscoverTab';
import { SolicitudesScreen } from './SolicitudesScreen';
import { SocialTab } from './SocialTab';
import { TierListsTab } from './TierListsTab';

export function MainScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { fontFamily, loaded } = useMontserrat();

  const [paginaActual, setPaginaActual] = useState(0);
  const [pantallaTierList, setPantallaTierList] = useState(0);
  const [mostrarBibliotecaAmigo, setMostrarBibliotecaAmigo] = useState(false);
  const [amigoUidSeleccionado, setAmigoUidSeleccionado] = useState('');
  const [mostrarSolicitudes, setMostrarSolicitudes] = useState(false);
  const [bibRefresh, setBibRefresh] = useState(0);
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

  // Simulate minimal loading time for Splash
  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => setAppReady(true), 2500);
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
      if (mostrarBibliotecaAmigo) {
        setMostrarBibliotecaAmigo(false);
        return true;
      }
      if (mostrarSolicitudes) {
        setMostrarSolicitudes(false);
        return true;
      }
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
  }, [isFocused, mostrarBibliotecaAmigo, mostrarSolicitudes, paginaActual, pantallaTierList]);

  if (!appReady) return <SplashView fontFamily={ff} />;

  const showBottomBar =
    !mostrarBibliotecaAmigo &&
    !mostrarSolicitudes &&
    !(paginaActual === 2 && pantallaTierList !== 0);

  const navigatePelicula = (id: number) => {
    navigation.navigate('Pelicula', { movieId: id });
  };

  const navigateActor = (id: number, name: string) => {
    navigation.navigate('Actor', { actorId: id, actorName: name });
  };

  const handleEliminarAmigoDesdeBib = async (uid: string) => {
    try {
      await eliminarAmigo(uid);
      setMostrarBibliotecaAmigo(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBloquearAmigoDesdeBib = async (uid: string) => {
    try {
      await bloquearUsuario(uid);
      setMostrarBibliotecaAmigo(false);
    } catch (e) {
      console.error(e);
    }
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
          mostrarSolicitudes ? (
            <SolicitudesScreen onVolverClick={() => setMostrarSolicitudes(false)} />
          ) : mostrarBibliotecaAmigo ? (
            <BibliotecaAmigoScreen
              amigoUid={amigoUidSeleccionado}
              onVolverClick={() => setMostrarBibliotecaAmigo(false)}
              onPeliculaClick={navigatePelicula}
              onEliminarAmigo={handleEliminarAmigoDesdeBib}
              onBloquearAmigo={handleBloquearAmigoDesdeBib}
            />
          ) : (
            <SocialTab
              fontFamily={ff}
              onUsuarioClick={(uid) => {
                setAmigoUidSeleccionado(uid);
                setMostrarBibliotecaAmigo(true);
              }}
              onSolicitudesClick={() => setMostrarSolicitudes(true)}
              onChatClick={(chatId, participants, chatName) => navigation.navigate('ChatDetail', { chatId, participants, chatName })}
              onPerfilClick={() => navigation.navigate('Perfil')}
              userFoto={userProfile?.fotoPerfil || user?.photoURL}
            />
          )
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
