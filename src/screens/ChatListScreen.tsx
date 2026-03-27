import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, View, Text, FlatList, Image, Pressable, 
  ActivityIndicator, StatusBar, Modal, ScrollView 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Services/Hooks/Types
import { observarMisChats, crearChat } from '../services/repositorioChats';
import { useSocialData } from '../hooks/social/useSocialData';
import { Chat } from '../types/chat';
import { GradientTop, GlassSurface, GlassBorder } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

export default function ChatListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { amigos } = useSocialData();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFriends, setShowFriends] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartChat = async (uid: string, name: string) => {
    setShowFriends(false);
    setLoading(true);
    try {
        const chatId = await crearChat([uid]);
        navigation.navigate('ChatDetail', { chatId, otherUserName: name });
    } catch (err: any) {
        setError('No se pudo crear el chat: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

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
            onPress={() => setShowFriends(true)}
        >
            <Ionicons name="add" size={28} color="#fff" />
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

      {/* Modal de Selección de Amigos */}
      <Modal
        visible={showFriends}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFriends(false)}
      >
        <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Nuevo Mensaje</Text>
                    <Pressable onPress={() => setShowFriends(false)} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </Pressable>
                </View>
                
                <ScrollView contentContainerStyle={styles.friendsList}>
                    {amigos.length === 0 ? (
                        <Text style={styles.emptyText}>No tienes amigos aún para chatear</Text>
                    ) : (
                        amigos.map(amigo => (
                            <Pressable 
                                key={amigo.uid} 
                                style={styles.friendItem}
                                onPress={() => handleStartChat(amigo.uid, amigo.username || 'Amigo')}
                            >
                                <View style={styles.friendAvatar}>
                                    {amigo.fotoPerfil ? (
                                        <Image source={{ uri: amigo.fotoPerfil }} style={styles.avatarImg} />
                                    ) : (
                                        <Ionicons name="person" size={20} color="#fff" />
                                    )}
                                </View>
                                <Text style={styles.friendName}>{amigo.username || amigo.email}</Text>
                                <Ionicons name="add-circle-outline" size={24} color="#38bdf8" />
                            </Pressable>
                        ))
                    )}
                </ScrollView>
            </View>
        </BlurView>
      </Modal>

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
  
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxHeight: '70%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 32, borderWidth: 1, borderColor: GlassBorder, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: GlassBorder },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  closeBtn: { padding: 4 },
  friendsList: { padding: 10 },
  friendItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
  friendAvatar: { width: 44, height: 44, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  friendName: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
});
