import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TextInput, Pressable, 
  KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Services/Types
import { observarMensajes, enviarMensaje } from '../services/repositorioChats';
import { iniciarMatch } from '../services/repositorioMatches';
import { Message } from '../types/message';
import { GradientTop, GlassSurface, GlassBorder } from '../theme/colors';
import { getFirebaseAuth } from '../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

export default function ChatDetailScreen({ navigation, route }: Props) {
  const { chatId, otherUserName, otherUserFoto } = route.params;
  const insets = useSafeAreaInsets();
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const uidActual = getFirebaseAuth()?.currentUser?.uid;

  useEffect(() => {
    return observarMensajes(chatId, (msgs) => {
      setMensajes(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
    });
  }, [chatId]);

  const handleSend = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      await enviarMensaje(chatId, texto);
      setTexto('');
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const handleStartMatch = async () => {
    try {
        const matchId = await iniciarMatch(chatId, [], { targetMatches: 3, excludeSeen: true });
        navigation.navigate('MovieMatch', { matchId, chatId });
    } catch (err) {
        console.error(err);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === uidActual;
    const isSystem = item.type === 'match_invite' || item.type === 'match_result';

    if (isSystem) {
        return (
            <View style={styles.systemMsg}>
                <BlurView intensity={20} tint="dark" style={styles.systemInner}>
                    <Ionicons name="sparkles" size={16} color="#38bdf8" style={{marginRight: 8}} />
                    <Text style={styles.systemText}>{item.text}</Text>
                    {item.type === 'match_invite' && (
                        <Pressable 
                            style={styles.systemBtn}
                            onPress={() => navigation.navigate('MovieMatch', { matchId: item.matchId!, chatId })}
                        >
                            <Text style={styles.systemBtnText}>ENTRAR</Text>
                        </Pressable>
                    )}
                </BlurView>
            </View>
        );
    }

    return (
      <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
        <BlurView 
            intensity={isMe ? 40 : 15} 
            tint="dark" 
            style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
        >
            <Text style={styles.msgText}>{item.text}</Text>
        </BlurView>
        <Text style={styles.msgTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{otherUserName}</Text>
            <Text style={styles.headerStatus}>En línea</Text>
        </View>
        <Pressable onPress={handleStartMatch} style={styles.gameBtn}>
            <LinearGradient colors={['#38bdf8', '#818cf8']} style={styles.gameBtnInner}>
                <Ionicons name="game-controller" size={20} color="#fff" />
            </LinearGradient>
        </Pressable>
      </BlurView>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <BlurView intensity={60} tint="dark" style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.inputInner}>
                <Pressable style={styles.attachBtn}>
                    <Ionicons name="add" size={26} color="rgba(255,255,255,0.6)" />
                </Pressable>
                <TextInput
                    value={texto}
                    onChangeText={setTexto}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    style={styles.input}
                    multiline
                />
                <Pressable 
                    onPress={handleSend} 
                    style={[styles.sendBtn, !texto.trim() && { opacity: 0.5 }]}
                    disabled={!texto.trim() || enviando}
                >
                    <Ionicons name="send" size={20} color="#fff" />
                </Pressable>
            </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: GlassBorder,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerStatus: { color: '#38bdf8', fontSize: 12, fontWeight: '600' },
  gameBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  gameBtnInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, paddingBottom: 40 },
  msgWrapper: { marginBottom: 16, maxWidth: '80%' },
  myMsgWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirMsgWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: GlassBorder },
  myBubble: { backgroundColor: 'rgba(56, 189, 248, 0.2)', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderBottomLeftRadius: 4 },
  msgText: { color: '#fff', fontSize: 16 },
  msgTime: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4 },
  inputContainer: { paddingTop: 10, paddingHorizontal: 20, borderTopWidth: 1, borderColor: GlassBorder },
  inputInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 4, paddingLeft: 10 },
  attachBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, color: '#fff', fontSize: 16, paddingHorizontal: 12, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#38bdf8', alignItems: 'center', justifyContent: 'center' },
  systemMsg: { alignSelf: 'center', marginVertical: 20, width: '90%' },
  systemInner: { padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  systemText: { color: '#fff', fontSize: 14, textAlign: 'center', fontWeight: '600', marginBottom: 10 },
  systemBtn: { backgroundColor: '#38bdf8', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  systemBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' }
});
