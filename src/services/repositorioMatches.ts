import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  onSnapshot, 
  updateDoc, 
  arrayUnion,
  getFirestore
} from 'firebase/firestore';
import { MovieMatch, MatchStatus } from '../types';

const obtenerDb = () => getFirestore();

export async function iniciarMatch(
  chatId: string, 
  creatorId: string, 
  participants: string[], 
  settings: { targetMatches: number, excludeSeen: boolean }
): Promise<string> {
  const db = obtenerDb();
  const matchesRef = collection(db, 'matches');
  const docRef = await addDoc(matchesRef, {
    chatId,
    creatorId,
    participants,
    status: 'active',
    settings,
    matchedMovies: [],
    votes: {},
    noVotes: {},
    createdAt: Date.now()
  });
  
  // Guardamos el match activo en el chat
  await updateDoc(doc(db, 'chats', chatId), {
    activeMatchId: docRef.id
  });
  
  return docRef.id;
}

export function observarMatch(matchId: string, callback: (m: MovieMatch) => void) {
  const db = obtenerDb();
  return onSnapshot(doc(db, 'matches', matchId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as MovieMatch);
    }
  });
}

export async function votarPelicula(matchId: string, uid: string, movieId: number, vote: 'yes' | 'no') {
  const db = obtenerDb();
  const matchDoc = doc(db, 'matches', matchId);
  const snap = await getDoc(matchDoc);
  if (!snap.exists()) return;
  
  const data = snap.data() as MovieMatch;
  const isYes = vote === 'yes';
  
  const field = isYes ? `votes.${movieId}` : `noVotes.${movieId}`;
  
  await updateDoc(matchDoc, {
    [field]: arrayUnion(uid)
  });

  // 🛡️ Comprobación de Match Total
  if (isYes) {
    const updatedSnap = await getDoc(matchDoc);
    const updatedData = updatedSnap.data() as MovieMatch;
    const currentVotes = updatedData.votes[movieId] || [];
    
    // Si TODOS han votado que sí
    if (currentVotes.length === data.participants.length) {
      await updateDoc(matchDoc, {
        matchedMovies: arrayUnion(movieId)
      });
      
      // Comprobar si hemos llegado al objetivo
      const finalSnap = await getDoc(matchDoc);
      const finalData = finalSnap.data() as MovieMatch;
      if (finalData.matchedMovies.length >= data.settings.targetMatches) {
        await updateDoc(matchDoc, {
          status: 'finished' as MatchStatus,
          finishedAt: Date.now()
        });
        // Cerramos el match en el chat
        await updateDoc(doc(db, 'chats', data.chatId), {
           activeMatchId: null
        });
      }
    }
  }
}
