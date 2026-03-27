import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import { cargarCarruselesActivos, guardarCarruselesActivos, cargarPlataformas, guardarPlataformas } from '../storage/preferences';

export async function sincronizarPreferenciasConFirestore(userId: string) {
  const db = getFirestoreDb();
  if (!db) return;

  const userRef = doc(db, 'usuarios', userId);
  const profileRef = doc(userRef, 'perfil', 'preferencias');

  try {
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      const data = snap.data();
      // Descargar de Firestore a Local
      if (data.carruseles) {
        await guardarCarruselesActivos(data.carruseles);
      }
      if (data.plataformas) {
        await guardarPlataformas(data.plataformas.map(String));
      }
    } else {
      // Subir de Local a Firestore si es la primera vez
      const localCarruseles = await cargarCarruselesActivos();
      const localPlataformas = await cargarPlataformas();
      await setDoc(profileRef, {
        carruseles: localCarruseles,
        plataformas: localPlataformas,
        updatedAt: new Set().add(Date.now()) // Just a trigger
      }, { merge: true });
    }
  } catch (error) {
    console.error('[userPreferences] Error al sincronizar:', error);
  }
}

export async function guardarPreferenciaFirestore(userId: string, key: 'carruseles' | 'plataformas', value: any) {
  const db = getFirestoreDb();
  if (!db) return;

  const profileRef = doc(db, 'usuarios', userId, 'perfil', 'preferencias');
  try {
    await setDoc(profileRef, {
      [key]: value,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error(`[userPreferences] Error al guardar ${key}:`, error);
  }
}
