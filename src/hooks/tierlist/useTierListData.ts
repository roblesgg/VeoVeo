import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerTierLists } from '../../services/repositorioTierLists';
import { listarPeliculasPorEstado } from '../../services/repositorioPeliculasUsuario';
import type { TierList } from '../../types/tierList';
import type { PeliculaUsuario } from '../../types/peliculaUsuario';

export function useTierListData() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierLists, setTierLists] = useState<TierList[]>([]);
  const [peliculasVistas, setPeliculasVistas] = useState<PeliculaUsuario[]>([]);
  const [textoBuscar, setTextoBuscar] = useState('');

  const peliculasMap = useMemo(() => peliculasVistas.reduce<Record<number, PeliculaUsuario>>((acc, p) => {
    acc[p.idPelicula] = p;
    return acc;
  }, {}), [peliculasVistas]);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [tl, vistas] = await Promise.all([
        obtenerTierLists(),
        listarPeliculasPorEstado('vista')
      ]);
      setTierLists(tl);
      setPeliculasVistas(vistas);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const filteredTierLists = useMemo(() => {
    const q = textoBuscar.trim().toLowerCase();
    if (!q) return tierLists;
    return tierLists.filter((t) => t.nombre.toLowerCase().includes(q));
  }, [tierLists, textoBuscar]);

  return {
    cargando,
    error,
    tierLists: filteredTierLists,
    rawTierLists: tierLists,
    peliculasVistas,
    peliculasMap,
    textoBuscar,
    setTextoBuscar,
    recargar: cargarDatos
  };
}
