import { useEffect, useState } from 'react';
import { tmdbApi } from '../../services/tmdbClient';
import type { CastMember, CollectionDetails, MovieDetails, WatchProvidersResponse } from '../../types/tmdb';

export function useMovieData(movieId: number) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detalles, setDetalles] = useState<MovieDetails | null>(null);
  const [reparto, setReparto] = useState<CastMember[]>([]);
  const [providers, setProviders] = useState<WatchProvidersResponse | null>(null);
  const [coleccion, setColeccion] = useState<CollectionDetails | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      setCargando(true);
      setError(null);
      try {
        const [d, c, p] = await Promise.all([
          tmdbApi.obtenerDetallesPelicula(movieId),
          tmdbApi.obtenerCreditosPelicula(movieId),
          tmdbApi.obtenerDondeVerConCache(movieId),
        ]);
        
        if (!alive) return;
        
        setDetalles(d);
        setReparto(c.cast.slice(0, 12));
        setProviders(p);

        if (d.belongs_to_collection) {
          const col = await tmdbApi.obtenerColeccion(d.belongs_to_collection.id);
          if (alive) setColeccion(col);
        } else {
          if (alive) setColeccion(null);
        }
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Error al cargar datos de TMDb');
      } finally {
        if (alive) setCargando(false);
      }
    })();
    return () => { alive = false; };
  }, [movieId]);

  return { cargando, error, detalles, reparto, providers, coleccion };
}
