/**
 * ARCHIVO: services/repositorioTierLists.ts
 * DESCRIPCIÓN: Gestiona la creación, edición y eliminación de Tier Lists personalizadas.
 * Permite a los usuarios organizar películas en rangos (S, A, B, etc.).
 */

import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import type { TierList } from '../types';
import { dbOrThrow, uidOrThrow } from './firebase';

/** Helper: Genera la referencia a la subcolección de tierLists del usuario. */
function baseRef(uid: string) {
  return collection(dbOrThrow(), 'usuarios', uid, 'tierLists');
}

/**
 * Crea una nueva Tier List en Firestore.
 */
export async function crearTierList(t: TierList): Promise<string> {
  const uid = uidOrThrow();
  const docRef = doc(baseRef(uid)); // Genera un ID automático
  const now = Date.now();
  
  const tierConId: TierList = {
    ...t,
    id: docRef.id,
    creadorUid: uid,
    fechaCreacion: now,
    ultimaModificacion: now,
    portadaUrl: t.portadaUrl ?? null,
  };
  
  await setDoc(docRef, tierConId);
  return docRef.id;
}

/**
 * Recupera todas las Tier Lists del usuario actual, ordenadas por la más reciente.
 */
export async function obtenerTierLists(): Promise<TierList[]> {
  const uid = uidOrThrow();
  const q = query(baseRef(uid), orderBy('ultimaModificacion', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ ...(d.data() as TierList), id: d.id }));
}

/**
 * Actualiza una Tier List existente.
 */
export async function actualizarTierList(t: TierList): Promise<void> {
  const uid = uidOrThrow();
  if (!t.id) throw new Error('TierList sin id');
  
  const updated: TierList = { 
    ...t, 
    ultimaModificacion: Date.now(),
    portadaUrl: t.portadaUrl || null // Aseguramos que sea null si no existe
  };
  
  await setDoc(doc(baseRef(uid), t.id), updated);
}

/**
 * Elimina permanentemente una Tier List.
 */
export async function eliminarTierList(tierListId: string): Promise<void> {
  const uid = uidOrThrow();
  await deleteDoc(doc(baseRef(uid), tierListId));
}
