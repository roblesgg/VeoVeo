import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import { listarPeliculasPorEstadoDeUsuario } from './repositorioPeliculasUsuario';

const db = getFirestoreDb()!;

export interface MatchSettings {
  participants: string[];
  targetMatches: number;
  mode: 'watchlist_only' | 'mixed';
}

/**
 * Inicia una sesión de Match cruzando las listas "Por Ver" de los participantes
 */
export async function iniciarSesionMatch(participantUids: string[], target = 3) {
  const matchId = `match_${Date.now()}_${participantUids.join('_')}`;

  // Obtener intersección de listas "Por Ver" para priorizar
  // Nota: En una app real esto se haría en el servidor (Cloud Function)
  // Aquí lo hacemos localmente extrayendo las listas

  const matchRef = doc(db, 'matches', matchId);
  await setDoc(matchRef, {
    id: matchId,
    participants: participantUids,
    settings: {
      targetMatches: target,
      mode: 'watchlist_only',
    },
    matchedMovies: [],
    votes: {}, // { movieId: { uid1: 'yes', uid2: 'no' } }
    status: 'active',
    createdAt: Date.now(),
  });

  return matchId;
}

/**
 * Obtiene candidatos para el Match priorizando la intersección de listas
 */
export async function obtenerCandidatosMatch(matchId: string, participants: string[]) {
  const { tmdbApi } = require('./tmdbClient');

  // 1. Obtener "Por ver" de todos
  const lists = await Promise.all(
    participants.map((uid) => listarPeliculasPorEstadoDeUsuario(uid, 'por_ver')),
  );

  // 2. Encontrar intersección (películas que están en más de una lista)
  const allMovieIds = lists.flatMap((l) => l.map((p) => p.idPelicula));
  const counts: Record<number, number> = {};
  allMovieIds.forEach((id) => (counts[id] = (counts[id] || 0) + 1));

  // Ordenar por popularidad/frecuencia
  const priorityIds = Object.keys(counts)
    .sort((a, b) => counts[Number(b)] - counts[Number(a)])
    .map(Number);

  // 3. Obtener detalles de TMDB para las prioritarias
  const priorityMovies = [];
  for (const id of priorityIds.slice(0, 15)) {
    try {
      const details = await tmdbApi.obtenerDetallesPelicula(id);
      priorityMovies.push(details);
    } catch (e) {}
  }

  // 4. Si faltan, rellenar con tendencias
  if (priorityMovies.length < 20) {
    const trending = await tmdbApi.obtenerTendencias();
    priorityMovies.push(...trending.results.slice(0, 20 - priorityMovies.length));
  }

  return priorityMovies;
}

export async function registrarVoto(
  matchId: string,
  userId: string,
  movieId: number,
  vote: 'yes' | 'no',
) {
  const matchRef = doc(db, 'matches', matchId);
  const snap = await getDoc(matchRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const votes = data.votes || {};
  if (!votes[movieId]) votes[movieId] = {};
  votes[movieId][userId] = vote;

  const participants = data.participants as string[];
  const everyoneVoted = participants.every((uid) => votes[movieId][uid] !== undefined);
  const everyoneSaidYes = participants.every((uid) => votes[movieId][uid] === 'yes');

  const updates: any = { votes };

  if (everyoneVoted && everyoneSaidYes) {
    updates.matchedMovies = arrayUnion(movieId);
    // Notificación de Match (Lógica de notificación aquí)
  }

  await updateDoc(matchRef, updates);
  return everyoneVoted && everyoneSaidYes;
}
