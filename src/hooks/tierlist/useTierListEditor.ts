/**
 * ARCHIVO: hooks/tierlist/useTierListEditor.ts
 * DESCRIPCIÓN: Hook para la gestión del estado y persistencia de una Tier List.
 * Maneja la lógica de mover películas entre rangos (Tiers), reordenación
 * y sincronización con Firestore (Crear, Editar, Eliminar).
 */

import { useState } from 'react';
import {
  actualizarTierList,
  crearTierList,
  eliminarTierList,
} from '../../services/repositorioTierLists';
import type { TierList } from '../../types';
import { todasLasPeliculasTierList } from '../../types';

type TierKey = 'tierObraMaestra' | 'tierMuyBuena' | 'tierBuena' | 'tierMala' | 'tierNefasta';

/**
 * Hook de negocio para el flujo de edición de Tier Lists.
 * @param onSuccess Callback ejecutado tras una operación exitosa (guardado/borrado).
 */
export function useTierListEditor(onSuccess: () => void) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierListActual, setTierListActual] = useState<TierList | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]); // IDs de películas elegidas del catálogo vistas

  /** 
   * 🔄 LÓGICA DE MOVIMIENTO:
   * Mueve una película de su rango actual a un nuevo rango o al "pool" (sin asignar).
   */
  const handleMoverPelicula = (movieId: number, targetTier: TierKey | 'pool') => {
    if (!tierListActual) return;

    // 1. Limpieza: Eliminamos el ID de todos los rangos posibles para evitar duplicados
    const clean: TierList = {
      ...tierListActual,
      tierObraMaestra: (tierListActual.tierObraMaestra || []).filter((id) => id !== movieId),
      tierMuyBuena: (tierListActual.tierMuyBuena || []).filter((id) => id !== movieId),
      tierBuena: (tierListActual.tierBuena || []).filter((id) => id !== movieId),
      tierMala: (tierListActual.tierMala || []).filter((id) => id !== movieId),
      tierNefasta: (tierListActual.tierNefasta || []).filter((id) => id !== movieId),
    };

    // 2. Asignación: Si el destino no es el pool, añadimos el ID al nuevo rango
    if (targetTier !== 'pool') {
      clean[targetTier] = [...(clean[targetTier] || []), movieId];
    }
    setTierListActual(clean);
  };

  /** Permite cambiar el orden interno de las películas dentro de un mismo rango */
  const handleReordenarTier = (tierKey: TierKey, newOrder: number[]) => {
    if (!tierListActual) return;
    setTierListActual({
      ...tierListActual,
      [tierKey]: newOrder,
    });
  };

  /** 💾 PERSISTENCIA: Guarda los cambios en Firestore */
  const handleGuardar = async () => {
    if (!tierListActual) return;
    setCargando(true);
    setError(null);
    try {
      if (!tierListActual.id) {
        // MODO CREACIÓN:
        // Aseguramos que todas las pelis seleccionadas que no hayan sido movidas
        // manualmente a un tier, se guarden por defecto en el último rango.
        const final = { ...tierListActual };
        const yaAsignadas = todasLasPeliculasTierList(final);
        for (const id of seleccionadas) {
          if (!yaAsignadas.includes(id)) {
            final.tierNefasta = [...final.tierNefasta, id];
          }
        }
        await crearTierList(final);
      } else {
        // MODO EDICIÓN
        await actualizarTierList(tierListActual);
      }
      onSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al guardar TierList';
      setError(msg);
      throw e; 
    } finally {
      setCargando(false);
    }
  };

  /** 🗑️ ELIMINACIÓN: Borra el documento de la Tier List */
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
    handleEliminar,
  };
}
