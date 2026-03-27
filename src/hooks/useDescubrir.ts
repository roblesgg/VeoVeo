import { useCallback, useEffect, useRef, useState } from 'react';
import { obtenerConfiguracionCarrusel } from '../constants/carruseles';
import { tmdbApi } from '../services/tmdbClient';
import type { Movie } from '../types/tmdb';

export function useDescubrir() {
  const [peliculasPorCarrusel, setPeliculasPorCarrusel] = useState<Record<string, Movie[]>>({});
  const [cargando, setCargando] = useState(false);
  const inflight = useRef(new Set<string>());
  const mapRef = useRef(peliculasPorCarrusel);

  useEffect(() => {
    mapRef.current = peliculasPorCarrusel;
  }, [peliculasPorCarrusel]);

  const cargarCarrusel = useCallback((titulo: string, forzar = false) => {
    if (!forzar && mapRef.current[titulo]?.length) return;
    if (inflight.current.has(titulo)) return;
    inflight.current.add(titulo);

    void (async () => {
      try {
        const config = obtenerConfiguracionCarrusel(titulo);
        let res;
        const randomPage = Math.floor(Math.random() * 8) + 1; // Changed from 10 to 8

        switch (config.tipo) {
          case 'TRENDING':
            res = await tmdbApi.obtenerTendencias('es-ES', config.payload as 'day' | 'week');
            // Variedad: Shuffle o slice aleatorio si hay muchos
            res.results = res.results.sort(() => Math.random() - 0.5);
            break;
          case 'POPULAR':
            res = await tmdbApi.obtenerPopulares('es-ES', randomPage);
            break;
          case 'NOW_PLAYING':
            res = await tmdbApi.obtenerEnCartelera('es-ES', randomPage);
            break;
          case 'TOP_RATED':
            res = await tmdbApi.obtenerMejorValoradas('es-ES', randomPage);
            break;
          case 'DISCOVER':
            res = await tmdbApi.descubrirPeliculas(config.payload + `&page=${randomPage}`);
            break;
          default:
            res = await tmdbApi.buscarPeliculasPorGenero(config.payload, 'es-ES', 'popularity.desc', randomPage);
        }

        const moviesWithProviders = await Promise.all(res.results.map(async (movie: Movie) => {
          try {
            const providersRes = await tmdbApi.obtenerDondeVerConCache(movie.id);
            const resES = providersRes.results['ES'];
            const providers = {
              flatrate: resES?.flatrate?.map(p => p.provider_id) || [],
              rent: [...(resES?.rent || []), ...(resES?.buy || [])].map(p => p.provider_id)
            };
            return { ...movie, providers };
          } catch {
            return movie;
          }
        }));

        setPeliculasPorCarrusel((m) => {
          if (!forzar && m[titulo]?.length) return m;
          return { ...m, [titulo]: moviesWithProviders };
        });
      } catch {
        // Ignorar fallos silenciosos
      } finally {
        inflight.current.delete(titulo);
      }
    })();
  }, []);

  const recargarTodosLosCarruseles = useCallback(async (carruselesActivos: string[]) => {
    setCargando(true);
    try {
      const promesas = carruselesActivos.map(async (titulo) => {
        try {
          const config = obtenerConfiguracionCarrusel(titulo);
          let res;
          const randomPage = Math.floor(Math.random() * 8) + 1;

          switch (config.tipo) {
            case 'TRENDING': 
              res = await tmdbApi.obtenerTendencias('es-ES'); 
              res.results = res.results.sort(() => Math.random() - 0.5);
              break;
            case 'POPULAR': res = await tmdbApi.obtenerPopulares('es-ES', randomPage); break;
            case 'NOW_PLAYING': res = await tmdbApi.obtenerEnCartelera('es-ES', randomPage); break;
            case 'TOP_RATED': res = await tmdbApi.obtenerMejorValoradas('es-ES', randomPage); break;
            case 'DISCOVER': res = await tmdbApi.descubrirPeliculas(config.payload + `&page=${randomPage}`); break;
            default:
              res = await tmdbApi.buscarPeliculasPorGenero(config.payload, 'es-ES', 'popularity.desc', randomPage);
          }
          const moviesWithProviders = await Promise.all(res.results.map(async (movie: Movie) => {
            try {
              const providersRes = await tmdbApi.obtenerDondeVerConCache(movie.id);
              const resES = providersRes.results['ES'];
              const providers = {
                flatrate: resES?.flatrate?.map(p => p.provider_id) || [],
                rent: [...(resES?.rent || []), ...(resES?.buy || [])].map(p => p.provider_id)
              };
              return { ...movie, providers };
            } catch {
              return movie;
            }
          }));
          return { titulo, peliculas: moviesWithProviders };
        } catch {
          return { titulo, peliculas: mapRef.current[titulo] || [] };
        }
      });

      const resultados = await Promise.all(promesas);
      const nuevoMapa: Record<string, Movie[]> = {};
      resultados.forEach(res => {
        nuevoMapa[res.titulo] = res.peliculas;
      });
      setPeliculasPorCarrusel(nuevoMapa);
    } finally {
      setCargando(false);
    }
  }, []);

  const limpiarCarrusel = useCallback((titulo: string) => {
    inflight.current.delete(titulo);
    setPeliculasPorCarrusel((m) => {
      const n = { ...m };
      delete n[titulo];
      return n;
    });
  }, []);

  return {
    peliculasPorCarrusel,
    cargando,
    cargarCarrusel,
    recargarTodosLosCarruseles,
    limpiarCarrusel,
  };
}
