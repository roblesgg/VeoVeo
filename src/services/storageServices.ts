/**
 * ARCHIVO: services/storageServices.ts
 * DESCRIPCIÓN: Gestiona la subida de archivos binarios (imágenes) a Firebase Storage.
 * Soluciona problemas específicos de compatibilidad entre Expo/React Native y Firebase.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

/**
 * Sube una imagen local (URI de la cámara o galería) a una ruta específica en la nube.
 * @param uri Ruta local del archivo en el dispositivo.
 * @param ruta Destino en el bucket de Storage (ej: 'perfiles/uid.jpg').
 * @returns La URL pública de descarga de la imagen subida.
 */
export async function subirImagenStorage(uri: string, ruta: string): Promise<string> {
  const storage = getFirebaseStorage();
  if (!storage) throw new Error('Servicio de Storage no configurado (falta API key o conexión).');

  const fileRef = ref(storage, ruta);

  /**
   * 🛠️ FIX NATIVO:
   * En React Native (Expo), fetch(uri).blob() suele fallar al interactuar con Firebase SDK.
   * La solución estándar y más estable es usar XMLHttpRequest de bajo nivel para capturar el BLOB.
   */
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response as Blob);
    };
    xhr.onerror = function () {
      reject(new Error('Fallo al cargar la imagen en memoria (XHR fallido).'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  // Intentamos subir los bytes del blob a Storage
  try {
    await uploadBytes(fileRef, blob);
  } catch (e: any) {
    const detail = e.customData?.serverResponse || e.message;
    throw new Error(`Detalle del servidor Storage: ${detail}`);
  }

  // IMPORTANTE: Liberar memoria del blob después de la subida
  // @ts-ignore
  if (blob.close) blob.close();

  // Generamos y devolvemos la URL de acceso público
  return getDownloadURL(fileRef);
}
