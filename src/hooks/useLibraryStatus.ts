import { useState, useEffect } from 'react';
import { onSnapshot, collection, getFirestore } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export function useLibraryStatus() {
  const { user } = useAuth();
  const [libraryMap, setLibraryMap] = useState<{ [id: number]: { estado: 'por_ver' | 'vista', valoracion: number } }>({});

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    
    // Escuchar "Por Ver"
    const unsubPv = onSnapshot(collection(db, 'usuarios', user.uid, 'biblioteca', 'por_ver', 'peliculas'), (snap) => {
       setLibraryMap(prev => {
         const next = { ...prev };
         snap.docs.forEach(doc => {
           const d = doc.data();
           next[d.idPelicula] = { estado: 'por_ver', valoracion: 0 };
         });
         return next;
       });
    });

    // Escuchar "Vistas"
    const unsubV = onSnapshot(collection(db, 'usuarios', user.uid, 'biblioteca', 'vistas', 'peliculas'), (snap) => {
       setLibraryMap(prev => {
         const next = { ...prev };
         snap.docs.forEach(doc => {
           const d = doc.data();
           next[d.idPelicula] = { estado: 'vista', valoracion: d.valoracion || 0 };
         });
         return next;
       });
    });

    return () => { unsubPv(); unsubV(); };
  }, [user]);

  return libraryMap;
}
