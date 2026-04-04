import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Keyboard,
  Animated,
  Modal, // 🆕 Para editar nombre de grupo
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { useAuth } from '../context/AuthContext';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { enviarMensaje, obtenerMensajesChat } from '../services/repositorioChats';
import { observarMatch } from '../services/repositorioMatches';
import { Message, MovieMatch } from '../types';
import { COLORS } from '../theme/colors';
import { SHADOWS } from '../theme/theme';

// 🕵️ Componente interno para manejar cada invitación de Match de forma individual
function MatchInvitation({ matchId, onEnter }: { matchId: string, onEnter: (id: string, finished: boolean) => void }) {
  const [matchData, setMatchData] = useState<MovieMatch | null>(null);

  useEffect(() => {
    return observarMatch(matchId, setMatchData);
  }, [matchId]);

  if (!matchData) return null;

  const isFinished = matchData.status === 'finished';
  const progress = matchData.matchedMovies.length;
  const target = matchData.settings.targetMatches;

  return (
    <View style={[styles.matchCard, isFinished ? styles.matchCardFinished : styles.matchCardActive]}>
      <View style={styles.matchIconRow}>
        <Ionicons name={isFinished ? "trophy" : "flame"} size={24} color={isFinished ? "#f1c40f" : "#38bdf8"} />
        <Text style={[styles.matchCardTitle, isFinished && { color: '#f1c40f' }]}>
          {isFinished ? '¡MATCH COMPLETADO!' : 'MOVIE MATCH EN CURSO'}
        </Text>
      </View>
      
      <Text style={styles.matchCardText}>
        {isFinished 
          ? `Habéis encontrado las ${target} coincidencias buscadas.` 
          : `Lleváis ${progress} de ${target} películas encontradas.`}
      </Text>

      <Pressable 
        onPress={() => onEnter(matchId, isFinished)}
        style={[styles.matchBtn, isFinished ? styles.matchBtnFinished : styles.matchBtnActive, SHADOWS.macLight]}
      >
        <Text style={[styles.matchBtnText, isFinished && { color: '#000' }]}>
          {isFinished ? 'Ver Películas Coincididas' : 'Continuar Jugando'}
        </Text>
        <Ionicons name={isFinished ? "eye-outline" : "chevron-forward"} size={18} color={isFinished ? "#000" : "#fff"} />
      </Pressable>
    </View>
  );
}

export function ChatDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const { chatId, chatName, activeMatchId: initialMatchId, participants: initialParticipants } = route.params;
  
  const [mensajes, setMensajes] = useState<Message[]>([]); // 🔄 Restaurado
  const [participants, setParticipants] = useState<string[]>(initialParticipants || []);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [editGroupName, setEditGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [texto, setTexto] = useState('');
  const [matchActivo, setMatchActivo] = useState<MovieMatch | null>(null);
  
  const listRef = useRef<FlatList>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current; // 🆕 Altura animada

  useEffect(() => {
    const unsub = obtenerMensajesChat(chatId, (msgs) => {
      setMensajes(msgs); 
    });
    
    // Obtener info del chat (nombre, participantes reales)
    const db = getFirestore();
    const chatRef = doc(db, 'chats', chatId);
    const unsubChat = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setChatInfo(data);
        setParticipants(data.participants || []);
        setNewGroupName(data.name || '');
      }
    });

    return () => { unsub(); unsubChat(); };
  }, [chatId]);

  // Observar el match si existe
  useEffect(() => {
    if (!initialMatchId) return;
    return observarMatch(initialMatchId, (m) => setMatchActivo(m));
  }, [initialMatchId]);

  // ⚡ [NUEVO] Reactividad total del teclado (Animado)
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height + 10, // 🆕 Subimos un poquito más (+10px)
        duration: Platform.OS === 'ios' ? e.duration : 200,
        useNativeDriver: false, // height no soporta native driver
      }).start();
      setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleEnviar = async () => {
    if (!texto.trim() || !user) return;
    const txt = texto.trim();
    setTexto('');
    await enviarMensaje(chatId, {
      chatId,
      senderId: user.uid,
      senderName: user.displayName || 'Usuario',
      text: txt,
      type: 'text'
    });
  };

  const irAMatch = () => {
    if (matchActivo) {
      navigation.navigate('MovieMatch', { matchId: matchActivo.id });
    } else {
      navigation.navigate('MatchConfig', { chatId, participants });
    }
  };

  const handleSaveGroupName = async () => {
    if (!newGroupName.trim()) return;
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'chats', chatId), { name: newGroupName.trim() });
      setEditGroupName(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Determinar título del chat
  const isGroup = participants.length > 2;
  const otherUid = participants.find(id => id !== user?.uid);
  const otherDetails = chatInfo?.participantDetails?.[otherUid || ''];
  const displayTitle = isGroup 
    ? (chatInfo?.name || `Grupo de ${participants.length} personas`) 
    : (otherDetails?.username || chatName || 'Chat');

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: 15 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          
          <Pressable 
            style={styles.headerInfo} 
            onPress={() => isGroup && setEditGroupName(true)}
            disabled={!isGroup}
          >
            <View style={styles.avatarMini}>
               {isGroup ? <Ionicons name="people" size={18} color="rgba(255,255,255,0.4)" /> : <Ionicons name="person" size={18} color="rgba(255,255,255,0.4)" />}
            </View>
            <View>
              <Text style={styles.chatTitle} numberOfLines={1}>{displayTitle}</Text>
              {isGroup && <Text style={styles.groupEditHint}>Toca para editar nombre</Text>}
            </View>
          </Pressable>
          
          <Pressable onPress={irAMatch} style={[styles.matchActionBtn, matchActivo && styles.matchActionBtnOn]}>
            <Ionicons name="flame" size={20} color={matchActivo ? "#fff" : "#ff6b00"} />
            {matchActivo && <Text style={styles.matchCounter}>{matchActivo.matchedMovies.length}</Text>}
          </Pressable>
        </View>
      </BlurView>

      <Animated.View style={[styles.flex, { paddingBottom: keyboardHeight }]}>
        <FlatList
          ref={listRef}
          data={[...mensajes].reverse()}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ 
            padding: 20, 
            paddingTop: 20, 
            paddingBottom: insets.top + 80
          }}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.uid;

            if (item.type === 'match_invite' && item.matchId) {
              return (
                <View style={[styles.msgWrapper, styles.msgMatch]}>
                   <MatchInvitation 
                      matchId={item.matchId} 
                      onEnter={(id, finished) => {
                        navigation.navigate('MovieMatch', { matchId: id });
                      }} 
                   />
                </View>
              );
            }

            return (
              <View style={[styles.msgWrapper, isMe ? styles.msgMe : styles.msgOther]}>
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={styles.msgText}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />

        <BlurView intensity={90} tint="dark" style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 22) }]}>
          <View style={styles.inputRow}>
            <Pressable style={styles.plusBtn}>
              <Ionicons name="add" size={26} color="rgba(255,255,255,0.4)" />
            </Pressable>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Escribe algo..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={styles.input}
              multiline
            />
            <Pressable onPress={handleEnviar} style={styles.sendBtn} disabled={!texto.trim()}>
              <Ionicons name="arrow-up" size={22} color="#000" />
            </Pressable>
          </View>
        </BlurView>
      </Animated.View>

      {/* Modal para editar nombre del grupo */}
      <Modal visible={editGroupName} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
           <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
           <View style={[styles.editModalContent, SHADOWS.mac]}>
              <Text style={styles.modalTitle}>Nombre del Grupo</Text>
              <TextInput 
                style={styles.modalInput} 
                value={newGroupName} 
                onChangeText={setNewGroupName}
                placeholder="Escribe un nombre para el grupo..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                autoFocus
              />
              <View style={styles.modalActions}>
                <Pressable onPress={() => setEditGroupName(false)} style={styles.modalBtnCancel}><Text style={styles.modalBtnText}>Cancelar</Text></Pressable>
                <Pressable onPress={handleSaveGroupName} style={styles.modalBtnSave}><Text style={styles.modalBtnText}>Guardar</Text></Pressable>
              </View>
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatarMini: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  chatTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  groupEditHint: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2 },
  matchActionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,107,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  matchActionBtnOn: { backgroundColor: '#ff6b00' },
  matchCounter: { position: 'absolute', top: -4, right: -4, backgroundColor: '#fff', paddingHorizontal: 6, borderRadius: 10, color: '#ff6b00', fontSize: 11, fontWeight: '900', ...SHADOWS.macLight },
  msgWrapper: { marginBottom: 16, maxWidth: '80%' },
  msgMe: { alignSelf: 'flex-end' },
  msgOther: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: 20 },
  bubbleMe: { backgroundColor: '#007AFF' },
  bubbleOther: { backgroundColor: 'rgba(255,255,255,0.1)' },
  msgText: { color: '#fff', fontSize: 16 },
  flex: { flex: 1 },
  inputWrapper: { 
    backgroundColor: '#020617', // Color sólido de fondo de la app para que no transparente nada
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 12,
  },
  plusBtn: { marginRight: 12 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, color: '#fff', fontSize: 16, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  
  // Estilos de la Invitación de Match
  msgMatch: { alignSelf: 'center', width: '90%', marginVertical: 10 },
  matchCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  matchCardActive: { backgroundColor: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)' },
  matchCardFinished: { backgroundColor: 'rgba(241, 196, 15, 0.05)', borderColor: 'rgba(241, 196, 15, 0.2)' },
  matchIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  matchCardTitle: { color: '#38bdf8', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' }, // 🆕 Añadido
  matchCardText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 },
  matchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16 },
  matchBtnActive: { backgroundColor: '#38bdf8' },
  matchBtnFinished: { backgroundColor: '#f1c40f' },
  matchBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  
  // Estilos del Modal de edición
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  editModalContent: { width: '85%', backgroundColor: '#1e293b', borderRadius: 32, padding: 24 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, color: '#fff', fontSize: 16, marginVertical: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtnCancel: { paddingHorizontal: 16, paddingVertical: 10 },
  modalBtnSave: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  modalBtnText: { color: '#fff', fontWeight: '700' },
});
