import type { ActorDetails, ActorMovieCredits, CollectionDetails, CreditsResponse, MovieDetails, MovieResponse, WatchProvidersResponse } from '../types/tmdb';
import * as preferences from '../storage/preferences';

const BASE_URL = 'https://api.themoviedb.org/3/';
const providerCache = new Map<number, WatchProvidersResponse>();

function getBearer(): string {
  const t = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  if (!t || !t.trim()) {
    throw new Error(
      'Falta EXPO_PUBLIC_TMDB_READ_TOKEN en .env (mismo token Bearer que RetrofitClient en Android).'
    );
  }
  return t.trim();
}

async function tmdbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getBearer()}`,
      accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

/** Igual que ApiService.kt */
export const tmdbApi = {
  async buscarPeliculas(nombrePelicula: string, idioma = 'es-ES') {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    const q = encodeURIComponent(nombrePelicula);
    return tmdbFetch<MovieResponse>(`search/movie?query=${q}&language=${idioma}&include_adult=${incluirAdulto}`);
  },

  async buscarPeliculasPorGenero(
    generoId: string,
    idioma = 'es-ES',
    orden = 'popularity.desc',
    pagina = 1
  ) {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<MovieResponse>(
      `discover/movie?with_genres=${encodeURIComponent(generoId)}&language=${idioma}&sort_by=${encodeURIComponent(orden)}&page=${pagina}&include_adult=${incluirAdulto}`
    );
  },

  async obtenerPopulares(idioma = 'es-ES', pagina = 1) {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<MovieResponse>(`movie/popular?language=${idioma}&page=${pagina}&include_adult=${incluirAdulto}`);
  },

  async obtenerEnCartelera(idioma = 'es-ES', pagina = 1) {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<MovieResponse>(`movie/now_playing?language=${idioma}&page=${pagina}&include_adult=${incluirAdulto}`);
  },

  async obtenerMejorValoradas(idioma = 'es-ES', pagina = 1) {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<MovieResponse>(`movie/top_rated?language=${idioma}&page=${pagina}&include_adult=${incluirAdulto}`);
  },

  async obtenerTendencias(idioma = 'es-ES', periodo: 'day' | 'week' = 'week') {
    return tmdbFetch<MovieResponse>(`trending/movie/${periodo}?language=${idioma}`);
  },

  async descubrirPeliculas(filtros: string, idioma = 'es-ES', pagina = 1) {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<MovieResponse>(`discover/movie?language=${idioma}&page=${pagina}&include_adult=${incluirAdulto}&${filtros}`);
  },

  async obtenerDetallesPelicula(movieId: number, idioma = 'es-ES') {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<MovieDetails>(`movie/${movieId}?language=${idioma}&include_adult=${incluirAdulto}`);
  },

  async obtenerCreditosPelicula(movieId: number, idioma = 'es-ES') {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<CreditsResponse>(`movie/${movieId}/credits?language=${idioma}&include_adult=${incluirAdulto}`);
  },

  async obtenerDondeVer(movieId: number) {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<WatchProvidersResponse>(`movie/${movieId}/watch/providers?include_adult=${incluirAdulto}`);
  },

  /** Versión con caché para optimizar listas largas */
  async obtenerDondeVerConCache(movieId: number): Promise<WatchProvidersResponse> {
    const cached = providerCache.get(movieId);
    if (cached) return cached;
    const res = await this.obtenerDondeVer(movieId);
    providerCache.set(movieId, res);
    return res;
  },

  async obtenerDetallesActor(actorId: number, idioma = 'es-ES') {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<ActorDetails>(`person/${actorId}?language=${idioma}&include_adult=${incluirAdulto}`);
  },

  async obtenerPeliculasActor(actorId: number, idioma = 'es-ES') {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<ActorMovieCredits>(`person/${actorId}/movie_credits?language=${idioma}&include_adult=${incluirAdulto}`);
  },

  async obtenerColeccion(collectionId: number, idioma = 'es-ES') {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<CollectionDetails>(`collection/${collectionId}?language=${idioma}&include_adult=${incluirAdulto}`);
  },
  
  async obtenerProveedoresRegion(region = 'ES', idioma = 'es-ES') {
    return tmdbFetch<{ results: any[] }>(`watch/providers/movie?language=${idioma}&watch_region=${region}`);
  },

  async buscarActores(query: string, idioma = 'es-ES') {
    const incluirAdulto = await preferences.cargarPreferenciaAdulto();
    return tmdbFetch<any>(`search/person?query=${encodeURIComponent(query)}&language=${idioma}&include_adult=${incluirAdulto}`);
  },
};

export function posterUrl(posterPath: string | null | undefined, width: 'w185' | 'w342' | 'w500' | 'original' = 'w185'): string | null {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/${width}${posterPath}`;
}

export function profileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w185${path}`;
}
