import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

export async function subirImagenStorage(uri: string, ruta: string): Promise<string> {
  const storage = getFirebaseStorage();
  if (!storage) throw new Error('Servicio de Storage no configurado (falta API key o conexión).');

  const fileRef = ref(storage, ruta);

  // En React Native (Expo), fetch(uri).blob() o base64 nativo falla internamente en Firebase.
  // La solución universal probada es usar XMLHttpRequest:
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

  // Subir el blob puro generado por XHR
  try {
    await uploadBytes(fileRef, blob);
  } catch (e: any) {
    const detail = e.customData?.serverResponse || e.message;
    throw new Error(`Detalle del servidor: ${detail}`);
  }

  // IMPORTANTE: Liberar memoria (React Native Blob implementation detail)
  // @ts-ignore
  if (blob.close) blob.close(); 

  // Devolver URL pública
  return getDownloadURL(fileRef);
}
