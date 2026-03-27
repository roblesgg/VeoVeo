import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getFirestoreDb } from '../../services/firebase';
import type { PeliculaUsuario } from '../../types/peliculaUsuario';

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
    const libRef = collection(db, 'usuarios', user.uid, 'peliculas');
    
    // Listener para "Por Ver"
    const qPorVer = query(libRef, where('estado', '==', 'por_ver'));
    const unsubPorVer = onSnapshot(qPorVer, (snap) => {
      const data = snap.docs.map(doc => ({ ...doc.data() } as PeliculaUsuario));
      setPorVer(data);
      if (cargando) setCargando(false);
    }, (err) => {
      console.error(err);
      setError('Error cargando biblioteca');
    });

    // Listener para "Vistas"
    const qVistas = query(libRef, where('estado', '==', 'vista'));
    const unsubVistas = onSnapshot(qVistas, (snap) => {
      const data = snap.docs.map(doc => ({ ...doc.data() } as PeliculaUsuario));
      setVistas(data);
      if (cargando) setCargando(false);
    }, (err) => {
      console.error(err);
      setError('Error cargando biblioteca');
    });

    return () => {
      unsubPorVer();
      unsubVistas();
    };
  }, [user?.uid, refreshToken]); // Depend on UID to handle user changes

  return { porVer, vistas, cargando, error };
}
