import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainBottomBar } from '../components/MainBottomBar';
import type { RootStackParamList } from '../navigation/types';
import { GradientBottom, GradientTop } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { obtenerPerfilUsuario } from '../services/repositorioUsuarios';
import { useMontserrat } from '../theme/useMontserrat';
import { SHADOWS } from '../theme/theme';
import { BlurView } from 'expo-blur';
import { BibliotecaAmigoScreen } from './BibliotecaAmigoScreen';
import { BibliotecaTab } from './BibliotecaTab';
import { DiscoverTab } from './DiscoverTab';
import { PeliculaScreen } from './PeliculaScreen';
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

  const ff = useMemo(() => fontFamily ?? 'System', [fontFamily]);

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

  const showBottomBar =
    !mostrarBibliotecaAmigo &&
    !mostrarSolicitudes &&
    !(paginaActual === 2 && pantallaTierList !== 0);

  const showProfileBtn =
    !(paginaActual === 2 && pantallaTierList !== 0) &&
    !mostrarBibliotecaAmigo &&
    !mostrarSolicitudes;

  if (!loaded) {
    return (
      <LinearGradient colors={[GradientTop, GradientBottom]} style={styles.flex}>
        <View />
      </LinearGradient>
    );
  }

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
            estaActiva={true}
            onPeliculaClick={navigatePelicula}
            onActorClick={navigateActor}
            onPerfilClick={() => navigation.navigate('Perfil')}
            userFoto={userProfile?.fotoPerfil || user?.photoURL}
          />
        ) : null}

        {paginaActual === 1 ? (
          <BibliotecaTab
            fontFamily={ff}
            refreshToken={bibRefresh}
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
            />
          ) : (
            <SocialTab
              fontFamily={ff}
              onUsuarioClick={(uid) => {
                setAmigoUidSeleccionado(uid);
                setMostrarBibliotecaAmigo(true);
              }}
              onSolicitudesClick={() => setMostrarSolicitudes(true)}
              onChatClick={() => navigation.navigate('ChatList')}
              onChatConAmigo={async (uid) => {
                const { crearChat } = await import('../services/repositorioChats');
                const chatId = await crearChat([uid]);
                navigation.navigate('ChatDetail', { chatId, otherUserName: 'Chat' });
              }}
              onPerfilClick={() => navigation.navigate('Perfil')}
              userFoto={userProfile?.fotoPerfil || user?.photoURL}
            />
          )
        ) : null}
      </View>

      {showBottomBar ? (
        <MainBottomBar onTabChange={setPaginaActual} paginaActual={paginaActual} />
      ) : null}

      {/* Profile button moved into tab headers */}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  perfilBtn: {
    position: 'absolute',
    right: 25,
    zIndex: 20,
  },
  perfilInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  perfilFoto: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
});
