import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Perfil: undefined;
  Ajustes: undefined;
  Bloqueados: undefined;
  Actor: { actorId: number; actorName: string };
  Pelicula: { movieId: number };
  Verification: undefined;
  ChatList: undefined;
  ChatDetail: { chatId: string; otherUserName: string; otherUserFoto?: string | null };
  MovieMatch: { matchId: string; chatId: string };
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;
