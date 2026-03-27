import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ActorScreen } from '../screens/ActorScreen';
import { AjustesScreen } from '../screens/AjustesScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MainScreen } from '../screens/MainScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { BloqueadosScreen } from '../screens/BloqueadosScreen';
import { PeliculaScreen } from '../screens/PeliculaScreen';
import { VerificationScreen } from '../screens/VerificationScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import MovieMatchScreen from '../screens/MovieMatchScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: [
    'veoveo://',
    'https://veoveo-app.netlify.app',
    'https://veoveo-app-install.netlify.app'
  ],
  config: {
    screens: {
      Main: 'main',
      Pelicula: 'movie/:movieId',
      Actor: 'actor/:actorId',
      Ajustes: 'ajustes',
      Perfil: 'perfil',
    },
  },
};

export function RootNavigator() {
  const { user, loading } = useAuth();

  return (
    <NavigationContainer linking={linking}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <Stack.Navigator
          key={user ? (user.emailVerified ? 'in' : 'ver') : 'out'}
          screenOptions={{ headerShown: false, animation: 'fade' }}
        >
          {user == null ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : !user.emailVerified ? (
            <>
              <Stack.Screen name="Verification" component={VerificationScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainScreen} />
              <Stack.Screen name="Perfil" component={PerfilScreen} />
              <Stack.Screen name="Bloqueados" component={BloqueadosScreen} />
              <Stack.Screen name="Ajustes" component={AjustesScreen} />
              <Stack.Screen name="Actor" component={ActorScreen} />
              <Stack.Screen name="Pelicula" component={PeliculaScreen} />
              <Stack.Screen name="ChatList" component={ChatListScreen} />
              <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
              <Stack.Screen name="MovieMatch" component={MovieMatchScreen} />
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
