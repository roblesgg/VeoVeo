import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import type { TierList } from '../types';
import { dbOrThrow, uidOrThrow } from './firebase';

function baseRef(uid: string) {
  return collection(dbOrThrow(), 'usuarios', uid, 'tierLists');
}

export async function crearTierList(t: TierList): Promise<string> {
  const uid = uidOrThrow();
  const docRef = doc(baseRef(uid));
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

export async function obtenerTierLists(): Promise<TierList[]> {
  const uid = uidOrThrow();
  const q = query(baseRef(uid), orderBy('ultimaModificacion', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ ...(d.data() as TierList), id: d.id }));
}

export async function actualizarTierList(t: TierList): Promise<void> {
  const uid = uidOrThrow();
  if (!t.id) throw new Error('TierList sin id');
  const updated: TierList = { 
    ...t, 
    ultimaModificacion: Date.now(),
    portadaUrl: t.portadaUrl || null // 🛡️ Fix
  };
  await setDoc(doc(baseRef(uid), t.id), updated);
}

export async function eliminarTierList(tierListId: string): Promise<void> {
  const uid = uidOrThrow();
  await deleteDoc(doc(baseRef(uid), tierListId));
}
