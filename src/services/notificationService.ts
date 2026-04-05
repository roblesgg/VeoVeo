import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

// Configuración por defecto de comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permisos y obtiene el token de Expo para notificaciones push.
 * Guarda el token en el perfil del usuario en Firestore.
 */
export async function registrarTokenEnFirestore(uid: string) {
  if (Platform.OS === 'web') return null; // Web requiere service workers complejos, omitimos por ahora
  
  if (!Device.isDevice) {
    console.warn('Debe ser un dispositivo físico para recibir notificaciones push');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('¡Permiso de notificaciones denegado!');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: 'db438c91-21eb-4020-a3ad-efec69cef405' // projectId de EAS
  })).data;

  console.log('📬 Expo Push Token:', token);

  // Guardar en Firestore
  const db = getFirestoreDb();
  if (db) {
    await updateDoc(doc(db, 'usuarios', uid), {
      pushToken: token
    });
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

/**
 * Envía una notificación push a través de la API de Expo.
 */
export async function enviarNotificacionPush(expoPushToken: string, title: string, body: string, data?: any) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
  };

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (e) {
    console.error('Error enviando push:', e);
  }
}

/**
 * Recupera el token de un usuario por su UID y le envía una notificación.
 */
export async function notificarAUsuario(uid: string, title: string, body: string, data?: any) {
  const db = getFirestoreDb();
  if (!db) return;
  
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (snap.exists()) {
    const userData = snap.data();
    if (userData.pushToken) {
      await enviarNotificacionPush(userData.pushToken, title, body, data);
    }
  }
}
