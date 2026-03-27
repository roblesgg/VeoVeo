import { useEffect, useState } from 'react';
import { tmdbApi } from '../../services/tmdbClient';
import type { ActorDetails, ActorMovie } from '../../types/tmdb';

export function useActorData(actorId: number) {
  const [detalles, setDetalles] = useState<ActorDetails | null>(null);
  const [peliculas, setPeliculas] = useState<ActorMovie[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const [d, c] = await Promise.all([
          tmdbApi.obtenerDetallesActor(actorId),
          tmdbApi.obtenerPeliculasActor(actorId),
        ]);
        if (mounted) {
          setDetalles(d);
          setPeliculas(c.cast);
        }
      } catch (err) {
        if (mounted) setError('Error al cargar datos del actor');
      } finally {
        if (mounted) setCargando(false);
      }
    })();
    return () => { mounted = false; };
  }, [actorId]);

  return { detalles, peliculas, cargando, error };
}
