/**
 * VeoVeo - Consolidated Type Definitions
 * This file centralizes all core data models for the application.
 */

// --- USER & PROFILE ---
export type UsuarioPerfil = {
  uid: string;
  username: string;
  email: string;
  fotoPerfil: string | null;
  amigos: string[];
  fechaCreacion?: number;
  bloqueados?: string[];
  estado?: 'online' | 'offline' | 'ausente';
  ultimoAcceso?: number;
  pushToken?: string;
};

// --- SOCIAL & FRIENDS ---
export type SolicitudAmistad = {
  id: string;
  deUid: string;
  paraUid: string;
  deUsername: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fecha: number;
};

// --- CHAT & MESSAGING ---
export type ChatType = 'individual' | 'group';

export type Chat = {
  id: string;
  type: ChatType;
  participants: string[];
  participantDetails?: { [uid: string]: Partial<UsuarioPerfil> };
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
  };
  activeMatchId?: string | null;
  createdAt: number;
  name?: string;
  groupIcon?: string;
};

export type MessageType = 'text' | 'movie' | 'match_invite' | 'match_result';

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: MessageType;
  timestamp: number;
  matchId?: string;
  movieData?: {
    id: number;
    title: string;
    posterPath: string;
  };
};

// --- MOVIE MATCHES ---
export type MatchStatus = 'active' | 'finished' | 'cancelled';

export type MovieMatch = {
  id: string;
  chatId: string;
  creatorId: string;
  participants: string[];
  status: MatchStatus;
  settings: {
    targetMatches: number;
    excludeSeen: boolean;
  };
  matchedMovies: number[];
  votes: { [movieId: number]: string[] };
  noVotes: { [movieId: number]: string[] };
  createdAt: number;
  finishedAt?: number;
};

// --- USER MOVIES ---
export type PeliculaUsuario = {
  idPelicula: number;
  titulo: string;
  rutaPoster: string | null;
  estado: 'por_ver' | 'vista';
  valoracion: number;
  fechaAnadido: number;
  fechaLanzamiento?: string;
  fechaVisto?: number;
  providers?: {
    flatrate: number[];
    rent: number[];
  };
};

// --- TIER LISTS ---
export type TierList = {
  id: string;
  nombre: string;
  descripcion: string;
  creadorUid: string;
  fechaCreacion: number;
  ultimaModificacion: number;
  tierObraMaestra: number[];
  tierMuyBuena: number[];
  tierBuena: number[];
  tierMala: number[];
  tierNefasta: number[];
  publica: boolean;
  portadaUrl?: string | null;
};

export function nuevaTierListVacia(): TierList {
  return {
    id: '',
    nombre: '',
    descripcion: '',
    creadorUid: '',
    fechaCreacion: Date.now(),
    ultimaModificacion: Date.now(),
    tierObraMaestra: [],
    tierMuyBuena: [],
    tierBuena: [],
    tierMala: [],
    tierNefasta: [],
    publica: false,
    portadaUrl: null,
  };
}

export function todasLasPeliculasTierList(t: TierList): number[] {
  return [...t.tierObraMaestra, ...t.tierMuyBuena, ...t.tierBuena, ...t.tierMala, ...t.tierNefasta];
}

// --- TMDB API ---
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number; // 🌟 Añadido para las estrellas!
  genre_ids?: number[];
  popularity?: number;
  providers?: {
    flatrate: number[];
    rent: number[];
  };
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: Genre[];
  original_language: string;
  popularity: number;
  belongs_to_collection: any | null;
  videos?: {
    results: any[];
  };
}

export interface ActorDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
}

export interface ActorMovieCredits {
  id: number;
  cast: Movie[];
}

export interface CollectionDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: Movie[];
}

export interface WatchProvidersResponse {
  results: {
    [region: string]: {
      link: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    };
  };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface CreditsResponse { 
  id: number; 
  cast: CastMember[]; 
  crew: CrewMember[]; 
}
export interface WatchProvider { logo_path: string; provider_id: number; provider_name: string; display_priority: number; }
