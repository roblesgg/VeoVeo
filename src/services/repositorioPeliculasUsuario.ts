import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { PeliculaUsuario } from '../types/peliculaUsuario';
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

function refPelicula(uid: string, idPelicula: number) {
  return doc(dbOrThrow(), 'usuarios', uid, 'peliculas', String(idPelicula));
}

/** Documento de la película en la biblioteca del usuario, o null. */
export async function obtenerPeliculaUsuario(idPelicula: number): Promise<PeliculaUsuario | null> {
  try {
    const uid = getFirebaseAuth()?.currentUser?.uid;
    const db = getFirestoreDb();
    if (!uid || !db) return null;
    const snap = await getDoc(doc(db, 'usuarios', uid, 'peliculas', String(idPelicula)));
    if (!snap.exists()) return null;
    return snap.data() as PeliculaUsuario;
  } catch {
    return null;
  }
}

export async function listarPeliculasPorEstado(estado: 'por_ver' | 'vista'): Promise<PeliculaUsuario[]> {
  const uid = uidOrThrow();
  const db = dbOrThrow();
  const q = query(collection(db, 'usuarios', uid, 'peliculas'), where('estado', '==', estado));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PeliculaUsuario);
}

export async function listarPeliculasPorEstadoDeUsuario(
  uid: string,
  estado: 'por_ver' | 'vista'
): Promise<PeliculaUsuario[]> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firebase no configurado');
  const q = query(collection(db, 'usuarios', uid, 'peliculas'), where('estado', '==', estado));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PeliculaUsuario);
}

export async function agregarPelicula(p: PeliculaUsuario): Promise<void> {
  const uid = uidOrThrow();
  await setDoc(refPelicula(uid, p.idPelicula), p);
}

export async function actualizarEstadoPelicula(idPelicula: number, nuevoEstado: 'por_ver' | 'vista'): Promise<void> {
  const uid = uidOrThrow();
  await updateDoc(refPelicula(uid, idPelicula), { estado: nuevoEstado });
}

export async function actualizarValoracion(idPelicula: number, valoracion: number): Promise<void> {
  const uid = uidOrThrow();
  await updateDoc(refPelicula(uid, idPelicula), { valoracion });
}

export async function eliminarPelicula(idPelicula: number): Promise<void> {
  const uid = uidOrThrow();
  await deleteDoc(refPelicula(uid, idPelicula));
}

/** Cuenta películas por estado (perfil); no lanza si no hay sesión. */
export async function contarPeliculasPorEstado(estado: string): Promise<number> {
  try {
    const uid = getFirebaseAuth()?.currentUser?.uid;
    const db = getFirestoreDb();
    if (!uid || !db) return 0;
    const q = query(collection(db, 'usuarios', uid, 'peliculas'), where('estado', '==', estado));
    const snap = await getDocs(q);
    return snap.size;
  } catch {
    return 0;
  }
}

/** Quitar de biblioteca y añadir como por ver (flujo Android al pasar de vista a por ver). */
export async function reemplazarPorPorVer(
  idPelicula: number,
  titulo: string,
  rutaPoster: string | null
): Promise<void> {
  await eliminarPelicula(idPelicula);
  await agregarPelicula({
    idPelicula,
    titulo,
    rutaPoster,
    estado: 'por_ver',
    valoracion: 0,
    fechaAnadido: Date.now(),
  });
}
