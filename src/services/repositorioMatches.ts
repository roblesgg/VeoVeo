import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  arrayUnion,
  getDocs,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase';
import type { MovieMatch, PlayerVote } from '../types/match';
import { enviarMensaje } from './repositorioChats';

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

/** Inicia una partida de Match */
export async function iniciarMatch(chatId: string, participantes: string[], settings: MovieMatch['settings']): Promise<string> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();

  const matchRef = doc(collection(db, 'matches'));
  const nuevaPartida: Omit<MovieMatch, 'id'> = {
    chatId,
    creatorId: uidActual,
    participants: Array.from(new Set([...participantes, uidActual])),
    status: 'active',
    settings,
    matchedMovies: [],
    createdAt: Date.now(),
  };

  await setDoc(matchRef, nuevaPartida);

  // Notificar en el chat
  await enviarMensaje(chatId, '¡Ha empezado un nuevo Movie Match! 🎬🍿 Desliza para elegir peli.', 'match_invite', matchRef.id);

  return matchRef.id;
}

/** Registra un voto de un usuario para una película */
export async function registrarVoto(matchId: string, movieId: number, voto: 'yes' | 'no'): Promise<void> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();

  const votoRef = doc(db, 'matches', matchId, 'votos', `${uidActual}_${movieId}`);
  await setDoc(votoRef, {
    uid: uidActual,
    movieId,
    vote: voto,
    timestamp: Date.now(),
  });

  // Verificar si hay match (todos han dicho 'yes')
  if (voto === 'yes') {
    await verificarMatch(matchId, movieId);
  }
}

async function verificarMatch(matchId: string, movieId: number) {
  const db = dbOrThrow();
  const matchSnap = await getDoc(doc(db, 'matches', matchId));
  if (!matchSnap.exists()) return;

  const matchData = matchSnap.data() as MovieMatch;
  const participantes = matchData.participants;

  // Consultar todos los votos para esta película
  const votosQ = query(collection(db, 'matches', matchId, 'votos'), where('movieId', '==', movieId), where('vote', '==', 'yes'));
  const votosSnap = await getDocs(votosQ);

  if (votosSnap.size === participantes.length) {
    // ¡MATCH ENCONTRADO!
    await updateDoc(doc(db, 'matches', matchId), {
      matchedMovies: arrayUnion(movieId)
    });

    // Notificar en el chat
    await enviarMensaje(matchData.chatId, `¡MATCH! 🎉 Todos queréis ver esta película.`, 'match_result', matchId);

    // Si llegamos al objetivo, finalizar
    if (matchData.matchedMovies.length + 1 >= matchData.settings.targetMatches) {
        await updateDoc(doc(db, 'matches', matchId), { status: 'finished', finishedAt: Date.now() });
    }
  }
}

/** Observa una partida de Match en tiempo real */
export function observarMatch(matchId: string, callback: (match: MovieMatch) => void): () => void {
  const db = dbOrThrow();
  return onSnapshot(doc(db, 'matches', matchId), (snap) => {
    if (snap.exists()) {
      callback({ ...snap.data(), id: snap.id } as MovieMatch);
    }
  });
}
