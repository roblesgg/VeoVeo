/**
 * ARCHIVO: services/repositorioUsuarios.ts
 * DESCRIPCIÓN: Gestiona la persistencia y recuperación de los perfiles de usuario en Firestore.
 * Incluye gestión de nombres de usuario, fotos de perfil, bloqueos y estado de conexión.
 */

import { doc, getDoc, setDoc, updateDoc, arrayRemove, type Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getFirebaseAuth, getFirestoreDb, dbOrThrow, uidOrThrow } from './firebase';
import type { UsuarioPerfil } from '../types';

/**
 * Obtiene el perfil completo del usuario autenticado actualmente.
 */
export async function obtenerPerfilUsuario(): Promise<UsuarioPerfil | null> {
  const db = getFirestoreDb();
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return null;

  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  return snap.data() as UsuarioPerfil;
}

/**
 * Obtiene el perfil de cualquier usuario mediante su UID.
 */
export async function obtenerPerfilUsuarioPorUid(uid: string): Promise<UsuarioPerfil | null> {
  const db = getFirestoreDb();
  if (!db || !uid) return null;
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  return snap.data() as UsuarioPerfil;
}

export const obtenerUsuarioPorUid = obtenerPerfilUsuarioPorUid;

/**
 * Crea un perfil básico en Firestore para nuevos usuarios.
 */
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

/**
 * Actualiza el nombre de pantalla del usuario.
 */
export async function actualizarUsername(nuevoUsername: string): Promise<void> {
  const db = dbOrThrow();
  const uid = uidOrThrow();
  const trimmed = nuevoUsername.trim();
  if (trimmed.length < 3) throw new Error('El nombre debe tener al menos 3 caracteres');

  // Guardamos tanto el username visual como una versión en minúsculas para facilitar búsquedas.
  await setDoc(doc(db, 'usuarios', uid), { 
    username: trimmed,
    username_servido: trimmed.toLowerCase() 
  }, { merge: true });
}

/**
 * Actualiza la URL de la foto de perfil del usuario.
 */
export async function actualizarFotoPerfil(url: string): Promise<void> {
  const db = dbOrThrow();
  const uid = uidOrThrow();
  await updateDoc(doc(db, 'usuarios', uid), { fotoPerfil: url });
}

/**
 * Obtiene el número total de amigos que tiene el usuario actual.
 */
export async function obtenerCantidadAmigos(): Promise<number> {
  const perfil = await obtenerPerfilUsuario();
  return perfil?.amigos?.length ?? 0;
}

/**
 * Obtiene la lista de UIDs de usuarios bloqueados por el usuario actual.
 */
export async function obtenerBloqueadosUids(): Promise<string[]> {
  const perfil = await obtenerPerfilUsuario();
  return perfil?.bloqueados ?? [];
}

/**
 * Elimina un usuario de la lista de bloqueados.
 */
export async function desbloquearUsuario(bloqueadoUid: string): Promise<void> {
  const db = dbOrThrow();
  const uid = uidOrThrow();
  await updateDoc(doc(db, 'usuarios', uid), {
    bloqueados: arrayRemove(bloqueadoUid),
  });
}

/**
 * Actualiza el estado de presencia (online/offline) en Firestore.
 */
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

export async function sincronizarVersionAppInstalada(uid: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !uid) return;

  await setDoc(
    doc(db, 'usuarios', uid),
    {
      appVersion: Constants.expoConfig?.version || '0.0.0',
      appVersionCode: Constants.expoConfig?.android?.versionCode ?? 0,
      platform: Platform.OS,
      ultimoAcceso: Date.now(),
    },
    { merge: true },
  );
}

/**
 * 🔄 SINCRONIZACIÓN DE PERFIL:
 * Asegura que los datos de Firebase Auth (como la foto de Google)
 * estén replicados en el documento de usuario de Firestore.
 * Se ejecuta cada vez que la app inicia con una sesión activa.
 */
export async function asegurarPerfilFirestore(user: User): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !user) return;

  const docRef = doc(db, 'usuarios', user.uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    // Escenario A: Usuario nuevo o primer inicio de sesión
    const nuevoPerfil: UsuarioPerfil = {
      uid: user.uid,
      username: user.displayName || `Usuario_${user.uid.slice(0, 6)}`,
      username_servido: (user.displayName || '').toLowerCase(),
      email: user.email || 'sin_email',
      fotoPerfil: user.photoURL || null,
      amigos: [],
      fechaCreacion: Date.now(),
    };
    await setDoc(docRef, nuevoPerfil);
  } else {
    // Escenario B: Usuario existente, sincronizamos datos si han cambiado en el proveedor (Google/Apple)
    const data = snap.data() as UsuarioPerfil;
    const updates: any = {};

    // Si no tiene foto en Firestore pero sí en el perfil de Auth, la importamos.
    if (!data.fotoPerfil && user.photoURL) {
      updates.fotoPerfil = user.photoURL;
    }

    // Aseguramos que existe el campo para búsquedas optimizadas.
    if (!data.username_servido && (data.username || user.displayName)) {
      updates.username_servido = (data.username || user.displayName || '').toLowerCase();
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(docRef, updates);
    }
  }
}
