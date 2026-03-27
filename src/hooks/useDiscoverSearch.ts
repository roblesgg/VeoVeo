import { useState, useEffect, useCallback } from 'react';
import { tmdbApi } from '../services/tmdbClient';
import type { Movie } from '../types/tmdb';

export function useDiscoverSearch() {
  const [textoBuscar, setTextoBuscar] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [tipoBusqueda, setTipoBusqueda] = useState<'movie' | 'person'>('movie');

  useEffect(() => {
    if (textoBuscar.length < 3) {
      setResultadosBusqueda([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        if (tipoBusqueda === 'movie') {
          const res = await tmdbApi.buscarPeliculas(textoBuscar, 'es-ES');
          const moviesWithProviders = await Promise.all(res.results.map(async (movie: Movie) => {
            try {
              const providersRes = await tmdbApi.obtenerDondeVer(movie.id);
              const resES = providersRes.results['ES'];
              const flatrate = resES?.flatrate?.map(p => p.provider_id) || [];
              const rent = [...(resES?.rent || []), ...(resES?.buy || [])].map(p => p.provider_id);
              return { ...movie, providers: { flatrate, rent } };
            } catch {
              return movie;
            }
          }));
          setResultadosBusqueda(moviesWithProviders);
        } else {
          const res = await tmdbApi.buscarActores(textoBuscar, 'es-ES');
          setResultadosBusqueda(res.results);
        }
      } catch {
        // Ignorar error de búsqueda
      } finally {
        setBuscando(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [textoBuscar, tipoBusqueda]);

  return {
    textoBuscar,
    setTextoBuscar,
    resultadosBusqueda,
    buscando,
    tipoBusqueda,
    setTipoBusqueda
  };
}
