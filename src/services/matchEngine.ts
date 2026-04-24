/**
 * ARCHIVO: services/matchEngine.ts
 * DESCRIPCIÓN: Motor de recomendaciones para las sesiones de Match.
 * Se encarga de cruzar las listas de "Por Ver" de los participantes para encontrar candidatos
 * ideales que mostrar durante el swipe.
 */

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
 * Inicia una sesión de Match analizando las preferencias de los usuarios involucrados.
 */
export async function iniciarSesionMatch(participantUids: string[], target = 3) {
  const matchId = `match_${Date.now()}_${participantUids.join('_')}`;

  const matchRef = doc(db, 'matches', matchId);
  await setDoc(matchRef, {
    id: matchId,
    participants: participantUids,
    settings: {
      targetMatches: target,
      mode: 'watchlist_only',
    },
    matchedMovies: [],
    votes: {}, // Almacena los votos individuales
    status: 'active',
    createdAt: Date.now(),
  });

  return matchId;
}

/**
 * ALGORITMO DE CANDIDATOS:
 * Obtiene películas candidatas para mostrar en el juego basándose en la intersección
 * de las listas "Por Ver" de todos los participantes.
 */
export async function obtenerCandidatosMatch(matchId: string, participants: string[]) {
  const { tmdbApi } = require('./tmdbClient');

  // 1. Obtener las listas "Por ver" de todos los participantes en paralelo
  const lists = await Promise.all(
    participants.map((uid) => listarPeliculasPorEstadoDeUsuario(uid, 'por_ver')),
  );

  // 2. Encontrar intersección: Películas que aparecen en las listas de varios amigos
  const allMovieIds = lists.flatMap((l) => l.map((p) => p.idPelicula));
  const counts: Record<number, number> = {};
  allMovieIds.forEach((id) => (counts[id] = (counts[id] || 0) + 1));

  // Ordenamos por mayor coincidencia (frecuencia en listas)
  const priorityIds = Object.keys(counts)
    .sort((a, b) => counts[Number(b)] - counts[Number(a)])
    .map(Number);

  // 3. Recuperar detalles de TMDB para las películas con mayor prioridad
  const priorityMovies = [];
  for (const id of priorityIds.slice(0, 15)) {
    try {
      const details = await tmdbApi.obtenerDetallesPelicula(id);
      priorityMovies.push(details);
    } catch (e) {
      // Ignorar errores individuales de TMDB
    }
  }

  // 4. RELLENO: Si hay pocas coincidencias, rellenamos con tendencias mundiales
  if (priorityMovies.length < 20) {
    const trending = await tmdbApi.obtenerTendencias();
    priorityMovies.push(...trending.results.slice(0, 20 - priorityMovies.length));
  }

  return priorityMovies;
}

/**
 * Registra un voto y comprueba si hay consenso total entre los amigos.
 */
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
  
  // Guardar voto específico
  votes[movieId][userId] = vote;

  const participants = data.participants as string[];
  // ¿Han votado todos ya esta película?
  const everyoneVoted = participants.every((uid) => votes[movieId][uid] !== undefined);
  // ¿Han dicho todos que SÍ?
  const everyoneSaidYes = participants.every((uid) => votes[movieId][uid] === 'yes');

  const updates: any = { votes };

  if (everyoneVoted && everyoneSaidYes) {
    // Si hay consenso positivo, añadimos a la lista de matches encontrados
    updates.matchedMovies = arrayUnion(movieId);
  }

  await updateDoc(matchRef, updates);
  return everyoneVoted && everyoneSaidYes;
}
