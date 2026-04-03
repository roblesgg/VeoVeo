import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { fetchCarouselData } from '../services/tmdbQueries';
import type { Movie } from '../types';

/**
 * Hook to manage movie carousels using TanStack Query.
 * @param titulos List of carousel titles to fetch.
 */
export function useDescubrir(titulos: string[] = []) {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: titulos.map((t) => ({
      queryKey: ['carousel', t],
      queryFn: () => fetchCarouselData(t),
      staleTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
    })),
  });

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

  const cargando = results.some((r) => r.isLoading);

  /** Triggered manually by components if lazy loading was intended, 
   * but useQueries handles it automatically. Keeping signature for compatibility. */
  const cargarCarrusel = useCallback((_titulo: string) => {
     // No-op - Query will be enabled if it's in the 'titulos' array
  }, []);

  const recargarTodosLosCarruseles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['carousel'] });
  }, [queryClient]);

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
