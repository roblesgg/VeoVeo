import { useState, useEffect } from 'react';
import { onSnapshot, collection } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getFirestoreDb } from '../services/firebase';

export function useLibraryStatus() {
  const { user } = useAuth();
  const [libraryMap, setLibraryMap] = useState<{
    [id: number]: { estado: 'por_ver' | 'vista'; valoracion: number };
  }>({});

  useEffect(() => {
    if (!user) {
      setLibraryMap({});
      return;
    }

    const db = getFirestoreDb();
    if (!db) return;

    const unsub = onSnapshot(collection(db, 'usuarios', user.uid, 'peliculas'), (snap) => {
      const next: {
        [id: number]: { estado: 'por_ver' | 'vista'; valoracion: number };
      } = {};

      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        next[data.idPelicula] = {
          estado: data.estado,
          valoracion: data.valoracion || 0,
        };
      });

      setLibraryMap(next);
    });

    return () => {
      unsub();
    };
  }, [user]);

  return libraryMap;
}
