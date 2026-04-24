/**
 * ARCHIVO: hooks/movie/useLibraryData.ts
 * DESCRIPCIÓN: Hook para la sincronización en tiempo real de la biblioteca completa.
 * Escucha la colección de películas del usuario en Firestore y separa los resultados
 * en dos estados reactivos: 'Por Ver' y 'Vistas'.
 */

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getFirestoreDb } from '../../services/firebase';
import type { PeliculaUsuario } from '../../types';

/**
 * Mantiene la sincronización de la biblioteca personal.
 * @param user Objeto de usuario autenticado.
 * @param refreshToken Trigger manual para forzar refresco si fuera necesario.
 */
export function useLibraryData(user: any, refreshToken: number) {
  const [porVer, setPorVer] = useState<PeliculaUsuario[]>([]);
  const [vistas, setVistas] = useState<PeliculaUsuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPorVer([]);
      setVistas([]);
      setCargando(false);
      return;
    }

    const db = getFirestoreDb();
    if (!db) return;
    
    // Referencia a la subcolección de películas del usuario
    const libRef = collection(db, 'usuarios', user.uid, 'peliculas');

    /** 📥 ESCUCHA "POR VER":
     * Filtra los documentos donde estado == 'por_ver'
     */
    const qPorVer = query(libRef, where('estado', '==', 'por_ver'));
    const unsubPorVer = onSnapshot(
      qPorVer,
      (snap) => {
        const data = snap.docs.map((doc) => ({ ...doc.data() }) as PeliculaUsuario);
        setPorVer(data);
        if (cargando) setCargando(false);
      },
      (err) => {
        console.error('Error onSnapshot PorVer:', err);
        setError('Error al sincronizar lista Por Ver');
      },
    );

    /** 📥 ESCUCHA "VISTAS":
     * Filtra los documentos donde estado == 'vista'
     */
    const qVistas = query(libRef, where('estado', '==', 'vista'));
    const unsubVistas = onSnapshot(
      qVistas,
      (snap) => {
        const data = snap.docs.map((doc) => ({ ...doc.data() }) as PeliculaUsuario);
        setVistas(data);
        if (cargando) setCargando(false);
      },
      (err) => {
        console.error('Error onSnapshot Vistas:', err);
        setError('Error al sincronizar lista de Vistas');
      },
    );

    // Limpieza de listeners al desmontar el componente
    return () => {
      unsubPorVer();
      unsubVistas();
    };
  }, [user?.uid, refreshToken]); // Reacciona ante cambios de usuario o trigger manual

  return { porVer, vistas, cargando, error };
}
