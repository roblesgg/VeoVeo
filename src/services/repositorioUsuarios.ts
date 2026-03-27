import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayRemove,
  type Firestore,
} from 'firebase/firestore';
import type { UsuarioPerfil } from '../types/usuario';
import { getFirebaseAuth, getFirestoreDb } from './firebase';

function dbOrThrow(): Firestore {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firebase no configurado');
  return db;
}

function uidOrThrow(): string {
  const uid = getFirebaseAuth()?.currentUser?.uid;
  if (!uid) throw new Error('Usuario no autenticado');
  return uid;
}

export async function obtenerPerfilUsuario(): Promise<UsuarioPerfil | null> {
  const db = getFirestoreDb();
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return null;

  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  return snap.data() as UsuarioPerfil;
}

export async function obtenerPerfilUsuarioPorUid(uid: string): Promise<UsuarioPerfil | null> {
  const db = getFirestoreDb();
  if (!db || !uid) return null;
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  return snap.data() as UsuarioPerfil;
}

export async function crearPerfilPorDefecto(): Promise<void> {
  const db = dbOrThrow();
  const uid = uidOrThrow();
  const email = getFirebaseAuth()?.currentUser?.email ?? 'sin_email';

  const usuario: UsuarioPerfil = {
    uid,
    username: `Usuario_${uid.slice(0, 6)}`,
    email,
    fotoPerfil: null,
    amigos: [],
    fechaCreacion: Date.now(),
  };

  await setDoc(doc(db, 'usuarios', uid), usuario);
}

export async function actualizarUsername(nuevoUsername: string): Promise<void> {
  const db = dbOrThrow();
  const uid = uidOrThrow();
  const trimmed = nuevoUsername.trim();
  if (trimmed.length < 3) throw new Error('El nombre debe tener al menos 3 caracteres');

  await setDoc(
    doc(db, 'usuarios', uid),
    { username: trimmed },
    { merge: true }
  );
}

export async function actualizarFotoPerfil(url: string): Promise<void> {
  const db = dbOrThrow();
  const uid = uidOrThrow();
  await updateDoc(doc(db, 'usuarios', uid), { fotoPerfil: url });
}

export async function obtenerCantidadAmigos(): Promise<number> {
  const perfil = await obtenerPerfilUsuario();
  return perfil?.amigos?.length ?? 0;
}

export async function obtenerBloqueadosUids(): Promise<string[]> {
  const perfil = await obtenerPerfilUsuario();
  return perfil?.bloqueados ?? [];
}

export async function desbloquearUsuario(bloqueadoUid: string): Promise<void> {
  const db = dbOrThrow();
  const uid = uidOrThrow();
  await updateDoc(doc(db, 'usuarios', uid), {
    bloqueados: arrayRemove(bloqueadoUid),
  });
}

export async function actualizarEstadoConexion(estado: 'online' | 'offline' | 'ausente'): Promise<void> {
  const db = getFirestoreDb();
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return;

  await updateDoc(doc(db, 'usuarios', uid), {
    estado,
    ultimoAcceso: Date.now(),
  });
}
