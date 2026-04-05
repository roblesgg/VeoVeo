import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { Chat, Message, ChatType } from '../types';
import { dbOrThrow } from './firebase';

export function observarMisChats(uid: string, callback: (chats: Chat[]) => void) {
  const db = dbOrThrow();
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat)));
  });
}

export async function crearChat(uids: string[], type: ChatType = 'individual', name?: string): Promise<string> {
  const db = dbOrThrow();
  const chatsRef = collection(db, 'chats');
  const docRef = await addDoc(chatsRef, {
    type,
    participants: uids,
    createdAt: Date.now(),
    name: name || null,
    lastMessage: null,
    activeMatchId: null
  });
  return docRef.id;
}

export function obtenerMensajesChat(chatId: string, callback: (msgs: Message[]) => void) {
  const db = dbOrThrow();
  const msgsRef = collection(db, 'chats', chatId, 'msj');
  const q = query(msgsRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
  });
}

export async function enviarMensaje(chatId: string, msg: Partial<Message>) {
  const db = dbOrThrow();
  const msgsRef = collection(db, 'chats', chatId, 'msj');
  const now = Date.now();
  await addDoc(msgsRef, {
    ...msg,
    timestamp: now
  });
  
  await updateDoc(doc(db, 'chats', chatId), {
    'lastMessage.text': msg.text,
    'lastMessage.senderId': msg.senderId,
    'lastMessage.timestamp': now
  });
}

export async function borrarChat(chatId: string) {
  const db = dbOrThrow();
  await deleteDoc(doc(db, 'chats', chatId));
}
