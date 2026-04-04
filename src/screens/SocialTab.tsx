import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { getFirestore, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { borrarChat } from '../services/repositorioChats';
import { Alert, Modal } from 'react-native';

// Hooks & Services
import { useSocialData } from '../hooks/social/useSocialData';
import { observarMisChats, crearChat } from '../services/repositorioChats';
import { Chat, UsuarioPerfil } from '../types';
import { useAuth } from '../context/AuthContext';

// Components
import { FriendRow } from '../components/social/FriendRow';
import { UserSearchRow } from '../components/social/UserSearchRow';
import { SolicitudesBadge } from '../components/social/SolicitudesBadge';
import { COLORS, CardSurface } from '../theme/colors';
import { SHADOWS } from '../theme/theme';

type Props = {
  fontFamily: string;
  onUsuarioClick: (uid: string) => void;
  onSolicitudesClick: () => void;
  onChatClick: (chatId: string, participants: string[], chatName?: string) => void; 
  onPerfilClick?: () => void;
  userFoto?: string | null;
};

export function SocialTab({
  fontFamily,
  onUsuarioClick,
  onSolicitudesClick,
  onChatClick,
  onPerfilClick,
  userFoto,
}: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [amigosSeleccionados, setAmigosSeleccionados] = useState<string[]>([]);

  const {
    amigos,
    resultados,
    solPendientesCount,
    solEnviadas,
    busqueda,
    setBusqueda,
    cargando,
    handleSendSolicitud,
    handleEliminarAmigo,
  } = useSocialData();

  useEffect(() => {
    if (!user) return;
    return observarMisChats(user.uid, (data) => {
      setChats(data);
      setLoadingChats(false);
    });
  }, [user]);

  const handleCrearChatMultiple = async () => {
    if (!user || amigosSeleccionados.length === 0) return;
    try {
      const allParticipants = [user.uid, ...amigosSeleccionados];
      const type = allParticipants.length > 2 ? 'group' : 'individual';
      const chatId = await crearChat(allParticipants, type);
      setMostrarSelector(false);
      setAmigosSeleccionados([]);
      onChatClick(chatId, allParticipants, type === 'group' ? 'Nueva conversación' : undefined);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBorrarChat = (chatId: string) => {
    Alert.alert('Borrar Chat', '¿Estás seguro? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: async () => {
          try {
            await borrarChat(chatId);
          } catch (e) {
             console.error(e);
          }
      }},
    ]);
  };

  const handleSetTab = (newTab: 0 | 1 | 2) => {
    setTab(newTab);
    Keyboard.dismiss();
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (tab !== 0) {
          setTab(0);
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [tab])
  );

  return (
    <View style={styles.flex}>
      <View style={[styles.headerRow, { top: Math.max(insets.top, 12) + 12 }]}>
        <Text style={[styles.titulo, { fontFamily, flex: 1 }]}>Social</Text>
        <View style={styles.actionsTopRow}>
          <Pressable onPress={() => onPerfilClick?.()} style={styles.perfilBtnMini}>
            <View style={styles.perfilInnerMini}>
              {userFoto ? (
                <Image source={{ uri: userFoto }} style={styles.perfilFotoMini} />
              ) : (
                <Ionicons name="person" size={20} color="#fff" />
              )}
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <SolicitudesBadge count={solPendientesCount} onPress={onSolicitudesClick} fontFamily={fontFamily} />

        <View style={styles.tabContainer}>
           <View style={styles.tabWrapper}>
              <Pressable onPress={() => handleSetTab(0)} style={[styles.tabBtn, tab === 0 && styles.tabOnBtn]}>
                <Text style={[styles.tabText, tab === 0 && styles.tabOnText, { fontFamily }]}>Chats</Text>
              </Pressable>
              <Pressable onPress={() => handleSetTab(1)} style={[styles.tabBtn, tab === 1 && styles.tabOnBtn]}>
                <Text style={[styles.tabText, tab === 1 && styles.tabOnText, { fontFamily }]}>Amigos</Text>
              </Pressable>
              <Pressable onPress={() => handleSetTab(2)} style={[styles.tabBtn, tab === 2 && styles.tabOnBtn]}>
                <Text style={[styles.tabText, tab === 2 && styles.tabOnText, { fontFamily }]}>Buscar</Text>
              </Pressable>
           </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 0 && (
            <View style={styles.chatList}>
              <Pressable 
                onPress={() => setMostrarSelector(true)}
                style={[styles.newChatCard, SHADOWS.macLight]}
              >
                <View style={styles.newChatCircle}>
                   <Ionicons name="add" size={26} color={COLORS.primary} />
                </View>
                <Text style={[styles.newChatText, { fontFamily }]}>Iniciar nueva conversación</Text>
              </Pressable>

              {loadingChats ? <ActivityIndicator color="#fff" style={{ marginTop: 20 }} /> : 
                chats.length === 0 ? <Text style={styles.emptyText}>No tienes conversaciones activas</Text> :
                chats.map(chat => {
                  const otherUid = chat.participants.find(id => id !== user?.uid);
                  // 🕵️ Buscamos al amigo en nuestra lista local para sacar su nombre real
                  const amigoDetalle = amigos.find(a => a.uid === otherUid);
                  const chatTitle = chat.name || amigoDetalle?.username || chat.participantDetails?.[otherUid || '']?.username || 'Chat...';
                  const avatarUri = amigoDetalle?.fotoPerfil || chat.participantDetails?.[otherUid || '']?.fotoPerfil || null;

                  return (
                    <Pressable 
                      key={chat.id} 
                      style={[styles.chatRow, SHADOWS.macLight]} 
                      onPress={() => onChatClick(chat.id, chat.participants, chatTitle)}
                    >
                      <View style={styles.chatAvatar}>
                        {avatarUri ? (
                          <Image source={{ uri: avatarUri }} style={styles.fullImg} />
                        ) : (
                          <Ionicons name={chat.type === 'group' ? 'people' : 'person'} size={24} color="rgba(255,255,255,0.4)" />
                        )}
                        {chat.activeMatchId && <View style={styles.matchDot} />}
                      </View>
                      <View style={styles.chatInfo}>
                        <Text style={[styles.chatName, { fontFamily }]}>{chatTitle}</Text>
                        <Text style={[styles.chatLastMsg, { fontFamily }]} numberOfLines={1}>
                          {chat.lastMessage?.text || 'Sin mensajes aún'}
                        </Text>
                      </View>
                      {chat.activeMatchId && (
                        <View style={styles.matchBadgeMini}>
                          <Ionicons name="flame" size={12} color="#ff6b00" />
                          <Text style={styles.matchBadgeText}>Match</Text>
                        </View>
                      )}
                      
                      <Pressable 
                        onPress={() => handleBorrarChat(chat.id)} 
                        hitSlop={8} 
                        style={styles.deleteBtn}
                      >
                         <Ionicons name="trash-outline" size={20} color="#ff4444" />
                      </Pressable>
                    </Pressable>
                  );
                })
              }
            </View>
          )}

          {tab === 1 && (
            <View>
              {amigos.map(a => (
                <FriendRow 
                  key={a.uid} 
                  amigo={a} 
                  onPress={() => onUsuarioClick(a.uid)} 
                  fontFamily={fontFamily} 
                />
              ))}
            </View>
          )}

          {tab === 2 && (
            <View>
              <TextInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar personas..." placeholderTextColor="rgba(255,255,255,0.4)" style={styles.searchInput} />
              {resultados.map(u => (
                <UserSearchRow key={u.uid} usuario={{...u, fotoPerfil: u.fotoPerfil || undefined}} enviada={solEnviadas.has(u.uid)} onAdd={() => handleSendSolicitud(u.uid)} fontFamily={fontFamily} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={mostrarSelector} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
           <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
           <View style={[styles.modalContent, SHADOWS.mac]}>
              <View style={styles.modalHeader}>
                 <Text style={[styles.modalTitle, { fontFamily }]}>Nueva conversación</Text>
                 <Pressable onPress={() => { setMostrarSelector(false); setAmigosSeleccionados([]); }} style={styles.modalClose}>
                    <Ionicons name="close" size={24} color="#fff" />
                 </Pressable>
              </View>

              <Text style={[styles.modalSubtitle, { fontFamily }]}>Selecciona uno o varios amigos</Text>

              <ScrollView style={styles.amigosSelector}>
                 {amigos.length === 0 ? <Text style={styles.emptyText}>No tienes amigos agregados</Text> : 
                   amigos.map(a => {
                     const selected = amigosSeleccionados.includes(a.uid);
                     return (
                       <Pressable 
                        key={a.uid} 
                        style={[styles.selectorRow, selected && styles.selectorRowOn]} 
                        onPress={() => {
                          setAmigosSeleccionados(prev => 
                            selected ? prev.filter(id => id !== a.uid) : [...prev, a.uid]
                          );
                        }}
                       >
                         <View style={styles.selectorAvatar}>
                            {a.fotoPerfil ? <Image source={{ uri: a.fotoPerfil }} style={styles.fullImg} /> : <Ionicons name="person" size={20} color="#fff" />}
                         </View>
                         <Text style={[styles.selectorName, { fontFamily }]}>{a.username}</Text>
                         <View style={[styles.checkbox, selected && styles.checkboxOn]}>
                            {selected && <Ionicons name="checkmark" size={14} color="#000" />}
                         </View>
                       </Pressable>
                     );
                   })
                 }
              </ScrollView>

              <Pressable 
                onPress={handleCrearChatMultiple} 
                disabled={amigosSeleccionados.length === 0}
                style={[styles.btnAceptar, amigosSeleccionados.length === 0 && { opacity: 0.4 }]}
              >
                 <Text style={[styles.btnAceptarText, { fontFamily }]}>Aceptar ({amigosSeleccionados.length})</Text>
              </Pressable>
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#020617' },
  titulo: { color: '#fff', fontSize: 32, fontWeight: '800' },
  headerRow: { position: 'absolute', left: 24, right: 24, zIndex: 10, flexDirection: 'row', alignItems: 'center' },
  actionsTopRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  perfilBtnMini: { marginLeft: 4 },
  perfilInnerMini: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  perfilFotoMini: { width: '100%', height: '100%' },
  content: { flex: 1, paddingTop: 130 },
  tabContainer: { paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  tabWrapper: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 4, justifyContent: 'space-between' },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
  tabOnBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '700' },
  tabOnText: { color: '#fff' },
  scroll: { paddingHorizontal: 20, paddingBottom: 140 },
  chatList: { gap: 12 },
  chatRow: { flexDirection: 'row', backgroundColor: CardSurface, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  chatAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  matchDot: { position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#ff6b00', borderWidth: 2, borderColor: '#1e293b' },
  chatInfo: { flex: 1 },
  chatName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  chatLastMsg: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  matchBadgeMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,0,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  matchBadgeText: { color: '#ff6b00', fontSize: 10, fontWeight: '800' },
  searchInput: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, color: '#fff', marginBottom: 16 },
  emptyText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 40 },
  newChatCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginBottom: 4,
  },
  newChatCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  newChatText: { color: '#38bdf8', fontSize: 16, fontWeight: '700' },
  fullImg: { width: '100%', height: '100%', borderRadius: 25 },
  deleteBtn: { padding: 8, marginLeft: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e293b', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '75%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  modalSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  amigosSelector: { flex: 1 },
  selectorRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
  selectorRowOn: { backgroundColor: 'rgba(56, 189, 248, 0.1)' },
  selectorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  selectorName: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  btnAceptar: { backgroundColor: '#38bdf8', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 20 },
  btnAceptarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
