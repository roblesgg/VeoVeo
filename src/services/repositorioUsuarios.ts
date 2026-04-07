import { doc, getDoc, setDoc, updateDoc, arrayRemove, type Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { getFirebaseAuth, getFirestoreDb, dbOrThrow, uidOrThrow } from './firebase';
import type { UsuarioPerfil } from '../types';

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

  await setDoc(doc(db, 'usuarios', uid), { username: trimmed }, { merge: true });
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

export async function actualizarEstadoConexion(
  estado: 'online' | 'offline' | 'ausente',
): Promise<void> {
  const db = getFirestoreDb();
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return;

  await updateDoc(doc(db, 'usuarios', uid), {
    estado,
    ultimoAcceso: Date.now(),
  });
}

/**
 * 🔄 Sincroniza el perfil de Auth con Firestore si es necesario.
 * Útil para capturar la foto de Google la primera vez.
 */
export async function asegurarPerfilFirestore(user: User): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !user) return;

  const docRef = doc(db, 'usuarios', user.uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    // Si no existe, creamos el perfil inicial con la foto de Auth si la hay
    const nuevoPerfil: UsuarioPerfil = {
      uid: user.uid,
      username: user.displayName || `Usuario_${user.uid.slice(0, 6)}`,
      email: user.email || 'sin_email',
      fotoPerfil: user.photoURL || null,
      amigos: [],
      fechaCreacion: Date.now(),
    };
    await setDoc(docRef, nuevoPerfil);
  } else {
    // 🔄 Sincronización Inteligente: 
    // Si NO tiene foto en Firestore pero SÍ tiene en Google, la vinculamos automáticamente.
    const data = snap.data() as UsuarioPerfil;
    const updates: any = {};

    if (!data.fotoPerfil && user.photoURL) {
      updates.fotoPerfil = user.photoURL;
    }

    // Sincronizar también el username_servido si no existe (para búsquedas)
    if (!data.username_servido && (data.username || user.displayName)) {
      updates.username_servido = (data.username || user.displayName || '').toLowerCase();
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(docRef, updates);
    }
  }
}
