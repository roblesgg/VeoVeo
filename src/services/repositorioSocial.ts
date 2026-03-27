import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { SolicitudAmistad } from '../types/solicitudAmistad';
import type { UsuarioPerfil } from '../types/usuario';
import { getFirebaseAuth, getFirestoreDb } from './firebase';

function uidOrThrow(): string {
  const uid = getFirebaseAuth()?.currentUser?.uid;
  if (!uid) throw new Error('Usuario no autenticado');
  return uid;
}

function dbOrThrow() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firebase no configurado');
  return db;
}

async function getPerfil(uid: string): Promise<UsuarioPerfil | null> {
  const db = dbOrThrow();
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  return snap.data() as UsuarioPerfil;
}

export async function buscarUsuarios(queryText: string): Promise<UsuarioPerfil[]> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();
  if (!queryText.trim()) return [];
  const snap = await getDocs(collection(db, 'usuarios'));
  const q = queryText.toLowerCase();
  return snap.docs
    .map((d) => d.data() as UsuarioPerfil)
    .filter((u) => u.uid !== uidActual && (u.username || '').toLowerCase().includes(q))
    .slice(0, 20);
}

export async function obtenerAmigos(): Promise<UsuarioPerfil[]> {
  const uidActual = uidOrThrow();
  const perfil = await getPerfil(uidActual);
  if (!perfil?.amigos?.length) return [];
  const db = dbOrThrow();
  const amigos: UsuarioPerfil[] = [];
  for (const uid of perfil.amigos) {
    const snap = await getDoc(doc(db, 'usuarios', uid));
    if (snap.exists()) amigos.push(snap.data() as UsuarioPerfil);
  }
  return amigos;
}

export function observarAmigos(callback: (amigos: UsuarioPerfil[]) => void): () => void {
  const db = dbOrThrow();
  let uidActual: string;
  try {
    uidActual = uidOrThrow();
  } catch {
    return () => {};
  }

  let unsubAmigos: (() => void) | null = null;

  const unsubPerfil = onSnapshot(doc(db, 'usuarios', uidActual), (perfilSnap) => {
    if (unsubAmigos) {
      unsubAmigos();
      unsubAmigos = null;
    }

    if (!perfilSnap.exists()) {
      callback([]);
      return;
    }
    const perfil = perfilSnap.data() as UsuarioPerfil;
    if (!perfil.amigos?.length) {
      callback([]);
      return;
    }

    const qAmigos = query(
      collection(db, 'usuarios'),
      where('uid', 'in', perfil.amigos.slice(0, 30))
    );

    unsubAmigos = onSnapshot(qAmigos, (amigosSnap) => {
      const listaAmigos = amigosSnap.docs.map((d) => d.data() as UsuarioPerfil);
      callback(listaAmigos);
    });
  });

  return () => {
    unsubPerfil();
    if (unsubAmigos) unsubAmigos();
  };
}

export async function obtenerSolicitudesPendientes(): Promise<SolicitudAmistad[]> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();
  const q = query(
    collection(db, 'solicitudes_amistad'),
    where('paraUid', '==', uidActual),
    where('estado', '==', 'pendiente')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as SolicitudAmistad), id: d.id }));
}

export async function obtenerSolicitudesEnviadasPendientesUids(): Promise<Set<string>> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();
  const q = query(
    collection(db, 'solicitudes_amistad'),
    where('deUid', '==', uidActual),
    where('estado', '==', 'pendiente')
  );
  const snap = await getDocs(q);
  return new Set(
    snap.docs.map((d) => (d.data() as SolicitudAmistad).paraUid).filter(Boolean)
  );
}

export async function enviarSolicitudAmistad(paraUid: string): Promise<void> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();
  const perfil = await getPerfil(uidActual);
  if (!perfil) throw new Error('No se encontró tu perfil');
  if (perfil.amigos?.includes(paraUid)) throw new Error('Ya son amigos');

  const yaPendienteQ = query(
    collection(db, 'solicitudes_amistad'),
    where('deUid', '==', uidActual),
    where('paraUid', '==', paraUid),
    where('estado', '==', 'pendiente')
  );
  const yaPendiente = await getDocs(yaPendienteQ);
  if (!yaPendiente.empty) throw new Error('Ya enviaste una solicitud a este usuario');

  const ref = doc(collection(db, 'solicitudes_amistad'));
  const solicitud: SolicitudAmistad = {
    id: ref.id,
    deUid: uidActual,
    paraUid,
    deUsername: perfil.username || 'Usuario',
    estado: 'pendiente',
    fecha: Date.now(),
  };
  await setDoc(ref, solicitud);
}

export async function aceptarSolicitud(solicitudId: string): Promise<void> {
  const db = dbOrThrow();
  const solSnap = await getDoc(doc(db, 'solicitudes_amistad', solicitudId));
  if (!solSnap.exists()) throw new Error('Solicitud no encontrada');
  const sol = solSnap.data() as SolicitudAmistad;

  await updateDoc(doc(db, 'usuarios', sol.deUid), {
    amigos: arrayUnion(sol.paraUid),
  });
  await updateDoc(doc(db, 'usuarios', sol.paraUid), {
    amigos: arrayUnion(sol.deUid),
  });
  await updateDoc(doc(db, 'solicitudes_amistad', solicitudId), { estado: 'aceptada' });
}

export async function rechazarSolicitud(solicitudId: string): Promise<void> {
  const db = dbOrThrow();
  await updateDoc(doc(db, 'solicitudes_amistad', solicitudId), { estado: 'rechazada' });
}

export async function eliminarAmigo(amigoUid: string): Promise<void> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();
  await updateDoc(doc(db, 'usuarios', uidActual), {
    amigos: arrayRemove(amigoUid),
  });
  await updateDoc(doc(db, 'usuarios', amigoUid), {
    amigos: arrayRemove(uidActual),
  });
}

export async function bloquearUsuario(amigoUid: string): Promise<void> {
  const db = dbOrThrow();
  const uidActual = uidOrThrow();
  await eliminarAmigo(amigoUid);
  await setDoc(
    doc(db, 'usuarios', uidActual),
    { bloqueados: arrayUnion(amigoUid) },
    { merge: true }
  );
}
