import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase';
import type { Chat, ChatType } from '../types/chat';
import type { Message } from '../types/message';

function uidOrThrow(): string {
  const uid = getFirebaseAuth()?.currentUser?.uid;
  if (!uid) throw new Error('Usuario no autenticado');
  return uid;
}

function dbOrThrow() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firebase no configurado');
  return db;
}

/** Crea un chat individual o grupal */
export async function crearChat(participantes: string[], tipo: ChatType = 'individual', nombre?: string): Promise<string> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();
  const todosParticipantes = Array.from(new Set([...participantes, uidActual]));

  // Si es individual, verificar si ya existe
  if (tipo === 'individual' && todosParticipantes.length === 2) {
    const q = query(
      collection(db, 'chats'),
      where('type', '==', 'individual'),
      where('participants', 'array-contains', uidActual)
    );
    const snap = await getDocs(q);
    const existente = snap.docs.find(d => {
      const p = (d.data() as Chat).participants;
      return p.length === 2 && p.includes(todosParticipantes[0]) && p.includes(todosParticipantes[1]);
    });
    if (existente) return existente.id;
  }

  const chatRef = doc(collection(db, 'chats'));
  const nuevoChat: Omit<Chat, 'id'> = {
    type: tipo,
    participants: todosParticipantes,
    createdAt: Date.now(),
    name: nombre,
  };

  await setDoc(chatRef, nuevoChat);
  return chatRef.id;
}

/** Observa la lista de chats del usuario */
export function observarMisChats(callback: (chats: Chat[]) => void, errorCallback?: (err: any) => void): () => void {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();

  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', uidActual),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map(d => ({ ...d.data(), id: d.id } as Chat));
    callback(chats);
  }, (err) => {
    console.error('Error en observarMisChats:', err);
    if (errorCallback) errorCallback(err);
  });
}

/** Envía un mensaje a un chat */
export async function enviarMensaje(chatId: string, texto: string, tipo: Message['type'] = 'text', matchId?: string): Promise<void> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();

  // 1. Añadir mensaje a la subcolección
  const msgRef = collection(db, 'chats', chatId, 'mensajes');
  const nuevoMsg: Omit<Message, 'id'> = {
    chatId,
    senderId: uidActual,
    senderName: getFirebaseAuth()?.currentUser?.displayName || 'Usuario',
    text: texto,
    type: tipo,
    timestamp: Date.now(),
    matchId,
  };
  await addDoc(msgRef, nuevoMsg);

  // 2. Actualizar último mensaje en el chat
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: {
      text: texto,
      senderId: uidActual,
      timestamp: Date.now(),
    }
  });
}

/** Observa los mensajes de un chat específico */
export function observarMensajes(chatId: string, callback: (mensajes: Message[]) => void, errorCallback?: (err: any) => void): () => void {
  const db = dbOrThrow();
  const q = query(
    collection(db, 'chats', chatId, 'mensajes'),
    orderBy('timestamp', 'asc'),
    limit(100)
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ ...d.data(), id: d.id } as Message));
    callback(msgs);
  }, (err) => {
    console.error('Error en observarMensajes:', err);
    if (errorCallback) errorCallback(err);
  });
}
