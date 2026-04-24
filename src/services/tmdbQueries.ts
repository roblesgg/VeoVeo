/**
 * ARCHIVO: services/tmdbQueries.ts
 * DESCRIPCIÓN: Abstracciones de alto nivel para obtener datos complejos de TMDB.
 * Se utiliza principalmente para alimentar los carruseles dinámicos de la pantalla 'Descubrir'.
 * Incluye lógica de paginación aleatoria y enriquecimiento con proveedores de streaming.
 */

import { obtenerConfiguracionCarrusel } from '../constants/carruseles';
import { tmdbApi } from './tmdbClient';
import type { Movie } from '../types';

/**
 * Obtiene los datos de una lista (carrusel) basándose en su título descriptivo.
 * Realiza una carga aleatoria de páginas para que el contenido siempre se vea fresco.
 */
export const fetchCarouselData = async (titulo: string) => {
  // Obtenemos la configuración (tipo de consulta TMDB y payload) según el título
  const config = obtenerConfiguracionCarrusel(titulo);
  let res;
  
  // Generamos una página aleatoria para variar los resultados mostrados
  let randomPage = Math.floor(Math.random() * 8) + 1;
  
  // 🍿 Optimización para contenido retro o muy específico:
  // Si la consulta es muy filtrada, limitamos el rango de páginas para evitar resultados vacíos.
  if (config.tipo === 'DISCOVER' && config.payload.includes('primary_release_date')) {
    randomPage = Math.floor(Math.random() * 3) + 1;
  }

  // Ejecutamos la consulta correspondiente en tmdbApi
  switch (config.tipo) {
    case 'TRENDING':
      res = await tmdbApi.obtenerTendencias('es-ES', config.payload as 'day' | 'week');
      // Mezclamos un poco los resultados de tendencias
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
      res = await tmdbApi.descubrirPeliculas(config.payload, 'es-ES', randomPage);
      break;
    default:
      // Por defecto buscamos por género si el tipo no coincide con los anteriores
      res = await tmdbApi.buscarPeliculasPorGenero(config.payload, 'es-ES', 'popularity.desc', randomPage);
  }

  /**
   * ENRIQUECIMIENTO (Data Hydration):
   * Para cada película obtenida, consultamos sus proveedores de streaming (Netflix, HBO, etc.).
   * Esto permite mostrar los logos de las plataformas directamente en el carrusel.
   */
  const moviesWithProviders = await Promise.all(
    res.results.map(async (movie: Movie) => {
      try {
        const providersRes = await tmdbApi.obtenerDondeVerConCache(movie.id);
        const resES = providersRes.results['ES']; // Filtramos por España
        const providers = {
          flatrate: resES?.flatrate?.map((p: any) => p.provider_id) || [], // Suscripción
          rent: [...(resES?.rent || []), ...(resES?.buy || [])].map((p: any) => p.provider_id), // Alquiler/Compra
        };
        return { ...movie, providers };
      } catch {
        // Si falla la consulta de proveedores, devolvemos la película sin los datos extra
        return movie;
      }
    }),
  );

  return moviesWithProviders;
};
