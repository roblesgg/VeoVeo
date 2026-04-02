import { doc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb } from '../services/firebase';

const db = getFirestoreDb()!;

export interface MatchSession {
  id: string;
  participants: string[];
  targetMatches: number;
  matchesFound: number[];
  status: 'active' | 'completed';
  priorityStack: number[]; // IDs intersection of Watchlists
  swipes: {
    [uid: string]: {
      [movieId: number]: boolean;
    };
  };
}

/**
 * Crea una sesión de Match entre usuarios
 */
export async function iniciarSesionMatch(participantUids: string[], targetCount = 3) {
  const sessionId = `match_${participantUids.sort().join('_')}`;
  const sessionRef = doc(db, 'match_sessions', sessionId);
  
  const snap = await getDoc(sessionRef);
  
  if (!snap.exists()) {
    await setDoc(sessionRef, {
      id: sessionId,
      participants: participantUids,
      targetMatches: targetCount,
      matchesFound: [],
      status: 'active',
      priorityStack: [], 
      updatedAt: serverTimestamp()
    });
  }
  
  return sessionId;
}

/**
 * Registra un voto (Swipe) en la sesión
 */
export async function registrarVoto(sessionId: string, uid: string, movieId: number, vote: boolean) {
  const sessionRef = doc(db, 'match_sessions', sessionId);
  const swipePath = `swipes.${uid}.${movieId}`;
  
  await updateDoc(sessionRef, {
    [swipePath]: vote,
    updatedAt: serverTimestamp()
  });

  const snap = await getDoc(sessionRef);
  const data = snap.data() as MatchSession;
  
  const allLiked = data.participants.every(pUid => 
    data.swipes?.[pUid]?.[movieId] === true
  );

  if (allLiked && !data.matchesFound.includes(movieId)) {
    await updateDoc(sessionRef, {
      matchesFound: arrayUnion(movieId),
      updatedAt: serverTimestamp()
    });
    
    if (data.matchesFound.length + 1 >= data.targetMatches) {
      await updateDoc(sessionRef, { status: 'completed' });
    }
    
    return true; 
  }

  return false;
}

/**
 * Escucha la sesión en tiempo real para avisos de Match
 */
export function escucharSesionMatch(sessionId: string, callback: (session: MatchSession) => void) {
  return onSnapshot(doc(db, 'match_sessions', sessionId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() } as MatchSession);
  });
}
