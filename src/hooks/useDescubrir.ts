/**
 * ARCHIVO: hooks/useDescubrir.ts
 * DESCRIPCIÓN: Hook personalizado para gestionar los carruseles de películas.
 * Utiliza TanStack Query para orquestar múltiples consultas paralelas a TMDB.
 * Permite recarga individual, global y limpieza de caché.
 */

import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { fetchCarouselData } from '../services/tmdbQueries';
import type { Movie } from '../types';

/**
 * Gestiona el estado de carga y datos de una lista de títulos de carrusel.
 * @param titulos Array de nombres de categorías (Tendencias, Popular, etc.)
 */
export function useDescubrir(titulos: string[] = []) {
  const queryClient = useQueryClient();

  // Ejecuta múltiples consultas en paralelo según los títulos recibidos
  const results = useQueries({
    queries: titulos.map((t) => ({
      queryKey: ['carousel', t],
      queryFn: () => fetchCarouselData(t),
      staleTime: 1000 * 60 * 30, // Los datos se consideran "frescos" durante 30 min
      retry: 1,
    })),
  });

  /** Mapea los resultados de las queries a un objeto indexado por el título */
  const peliculasPorCarrusel = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    titulos.forEach((t, i) => {
      const query = results[i];
      if (query?.data) {
        map[t] = query.data;
      }
    });
    return map;
  }, [titulos, results]);

  /** Estado global de carga (si al menos uno está cargando) */
  const cargando = results.some((r) => r.isLoading);

  /** 
   * Fuerza la recarga de un carrusel específico invalidando su caché.
   */
  const cargarCarrusel = useCallback((titulo: string, forzar?: boolean) => {
    if (forzar) {
      queryClient.invalidateQueries({ queryKey: ['carousel', titulo] });
    }
  }, [queryClient]);

  /** Invalida todos los carruseles activos */
  const recargarTodosLosCarruseles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['carousel'] });
  }, [queryClient]);

  /** Elimina los datos de un carrusel de la caché */
  const limpiarCarrusel = useCallback((titulo: string) => {
    queryClient.removeQueries({ queryKey: ['carousel', titulo] });
  }, [queryClient]);

  return {
    peliculasPorCarrusel,
    cargando,
    cargarCarrusel,
    recargarTodosLosCarruseles,
    limpiarCarrusel,
  };
}
