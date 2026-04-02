import { doc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, serverTimestamp, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { getFirestoreDb } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Movie } from '../types/tmdb';

const db = getFirestoreDb()!;

export interface ChatMessage {
  id?: string;
  senderId: string;
  type: 'text' | 'movie' | 'match_alert';
  text?: string;
  movieData?: {
    id: number;
    title: string;
    posterPath: string;
  };
  timestamp: any;
}

/**
 * Crea un chat directo o grupal
 */
export async function crearChat(participantUids: string[], isGroup = false, groupMetadata?: any) {
  const participants = participantUids.sort(); // Orden para IDs estables
  const chatId = isGroup ? `group_${Date.now()}` : `direct_${participants.join('_')}`;
  
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  
  if (!snap.exists()) {
    await setDoc(chatRef, {
      id: chatId,
      participants,
      type: isGroup ? 'group' : 'direct',
      metadata: groupMetadata || {},
      lastMessage: null,
      updatedAt: serverTimestamp()
    });
  }
  
  return chatId;
}

/**
 * Envía un mensaje (Texto o Película)
 */
export async function enviarMensaje(chatId: string, senderId: string, content: string | Movie, type: 'text' | 'movie' = 'text') {
  const msgRef = collection(db, 'chats', chatId, 'messages');
  
  let msgData: any = {
    senderId,
    type,
    timestamp: serverTimestamp(),
  };

  if (type === 'movie') {
    const movie = content as Movie;
    msgData.movieData = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path
    };
    msgData.text = `🎬 ${movie.title}`;
  } else {
    msgData.text = content as string;
  }

  const newDoc = await addDoc(msgRef, msgData);
  
  // Actualizar puntero del último mensaje
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: {
      text: msgData.text,
      senderId,
      timestamp: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });

  return newDoc.id;
}

/**
 * Escucha mensajes en tiempo real
 */
export function escucharMensajes(chatId: string, callback: (msgs: ChatMessage[]) => void) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    callback(msgs);
  });
}
