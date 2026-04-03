import { obtenerConfiguracionCarrusel } from '../constants/carruseles';
import { tmdbApi } from './tmdbClient';
import type { Movie } from '../types';

export const fetchCarouselData = async (titulo: string) => {
  const config = obtenerConfiguracionCarrusel(titulo);
  let res;
  const randomPage = Math.floor(Math.random() * 8) + 1;

  switch (config.tipo) {
    case 'TRENDING':
      res = await tmdbApi.obtenerTendencias('es-ES', config.payload as 'day' | 'week');
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
      res = await tmdbApi.buscarPeliculasPorGenero(config.payload, 'es-ES', 'popularity.desc', randomPage);
  }

  const moviesWithProviders = await Promise.all(
    res.results.map(async (movie: Movie) => {
      try {
        const providersRes = await tmdbApi.obtenerDondeVerConCache(movie.id);
        const resES = providersRes.results['ES'];
        const providers = {
          flatrate: resES?.flatrate?.map((p: any) => p.provider_id) || [],
          rent: [...(resES?.rent || []), ...(resES?.buy || [])].map((p: any) => p.provider_id),
        };
        return { ...movie, providers };
      } catch {
        return movie;
      }
    }),
  );

  return moviesWithProviders;
};
