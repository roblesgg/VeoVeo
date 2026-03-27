import { useState } from 'react';
import { 
  actualizarTierList, 
  crearTierList, 
  eliminarTierList 
} from '../../services/repositorioTierLists';
import type { TierList } from '../../types/tierList';
import { nuevaTierListVacia, todasLasPeliculasTierList } from '../../types/tierList';

type TierKey = 'tierObraMaestra' | 'tierMuyBuena' | 'tierBuena' | 'tierMala' | 'tierNefasta';

export function useTierListEditor(onSuccess: () => void) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierListActual, setTierListActual] = useState<TierList | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);

  const handleMoverPelicula = (movieId: number, targetTier: TierKey | 'pool') => {
    if (!tierListActual) return;
    
    // Remover de todos los tiers primero
    const clean: TierList = {
      ...tierListActual,
      tierObraMaestra: (tierListActual.tierObraMaestra || []).filter(id => id !== movieId),
      tierMuyBuena: (tierListActual.tierMuyBuena || []).filter(id => id !== movieId),
      tierBuena: (tierListActual.tierBuena || []).filter(id => id !== movieId),
      tierMala: (tierListActual.tierMala || []).filter(id => id !== movieId),
      tierNefasta: (tierListActual.tierNefasta || []).filter(id => id !== movieId),
    };

    if (targetTier !== 'pool') {
      // Agregar al destino
      clean[targetTier] = [...(clean[targetTier] || []), movieId];
    }
    setTierListActual(clean);
  };

  const handleReordenarTier = (tierKey: TierKey, newOrder: number[]) => {
    if (!tierListActual) return;
    setTierListActual({
      ...tierListActual,
      [tierKey]: newOrder
    });
  };

  const handleGuardar = async () => {
    if (!tierListActual) return;
    setCargando(true);
    setError(null);
    try {
      if (!tierListActual.id) {
        // Al crear, incluimos las seleccionadas que no tengan tier en 'Nefasta' por defecto
        let final = { ...tierListActual };
        const yaAsignadas = todasLasPeliculasTierList(final);
        for (const id of seleccionadas) {
          if (!yaAsignadas.includes(id)) {
            final.tierNefasta = [...final.tierNefasta, id];
          }
        }
        await crearTierList(final);
      } else {
        await actualizarTierList(tierListActual);
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar TierList');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    setCargando(true);
    try {
      await eliminarTierList(id);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setCargando(false);
    }
  };

  return {
    tierListActual,
    setTierListActual,
    seleccionadas,
    setSeleccionadas,
    cargando,
    error,
    handleMoverPelicula,
    handleReordenarTier,
    handleGuardar,
    handleEliminar
  };
}
