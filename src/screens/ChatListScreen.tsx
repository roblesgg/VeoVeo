import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, View, Text, FlatList, Image, Pressable, 
  ActivityIndicator, StatusBar 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Services/Types
import { observarMisChats } from '../services/repositorioChats';
import { Chat } from '../types/chat';
import { GradientTop, GlassSurface, GlassBorder } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

export default function ChatListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    
    try {
      unsub = observarMisChats((newChats) => {
        setChats(newChats);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error('Error en observarMisChats:', err);
        setError('Error al cargar chats: ' + err.message);
        setLoading(false);
      });
    } catch (err: any) {
      console.error('Error fatal en ChatList:', err);
      setError(err.message || 'Error desconocido');
      setLoading(false);
    }

    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (!error) setError('La carga está tardando demasiado. Verifica tu conexión o los índices de Firestore.');
      }
    }, 15000);

    return () => {
      if (unsub) unsub();
      clearTimeout(timer);
    };
  }, []);

  const renderChatItem = ({ item }: { item: Chat }) => {
    // Simplificación: En individual, mostrar el otro participante
    // En real necesitaríamos un hook que cargue detalles de perfiles
    return (
      <Pressable 
        style={styles.chatCard}
        onPress={() => navigation.navigate('ChatDetail', { 
            chatId: item.id, 
            otherUserName: item.name || 'Chat' 
        })}
      >
        <BlurView intensity={20} tint="dark" style={styles.chatCardInner}>
            <View style={styles.avatarPlaceholder}>
                <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
            </View>
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name || 'Conversación'}</Text>
                    {item.lastMessage && (
                        <Text style={styles.chatTime}>
                            {new Date(item.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}
                </View>
                <Text style={styles.lastMsg} numberOfLines={1}>
                    {item.lastMessage?.text || 'No hay mensajes todavía'}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
        </BlurView>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[GradientTop, '#000']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Mensajes</Text>
        <Pressable 
            style={styles.newChatBtn} 
            onPress={() => navigation.goBack()} // Volver a social para elegir amigo es lo más fácil ahora
        >
            <Ionicons name="people" size={24} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={[styles.emptyText, { marginTop: 20 }]}>Buscando tus mensajes...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff8a80" />
          <Text style={[styles.errorText, { paddingHorizontal: 40 }]}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => navigation.replace('ChatList')}>
            <Text style={styles.retryText}>REINTENTAR</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>No tienes conversaciones activas</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingBottom: 15,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  newChatBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  chatCard: { marginBottom: 16, borderRadius: 24, overflow: 'hidden' },
  chatCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: GlassBorder },
  avatarPlaceholder: { width: 54, height: 54, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  chatContent: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  chatTime: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  lastMsg: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16, marginTop: 16, textAlign: 'center' },
  errorText: { color: '#ff8a80', fontSize: 16, marginTop: 16, textAlign: 'center', lineHeight: 22 },
  retryBtn: { marginTop: 30, backgroundColor: '#38bdf8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
