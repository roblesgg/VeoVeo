/**
 * ARCHIVO: services/notificationService.ts
 * DESCRIPCION: Gestiona el sistema de notificaciones push de la aplicacion utilizando Expo Notifications.
 * Incluye el registro del dispositivo, obtencion de tokens y envio de notificaciones entre usuarios.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

export const DEFAULT_NOTIFICATION_CHANNEL_ID = 'default';

/**
 * CONFIGURACION GLOBAL: Comportamiento cuando llega una notificacion.
 * Aqui definimos que siempre se muestre la alerta, suene y actualice el badge.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function ensureNotificationChannelConfigured() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(DEFAULT_NOTIFICATION_CHANNEL_ID, {
    name: 'Actualizaciones y avisos',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0EA5E9',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: true,
  });
}

/**
 * Solicita permisos de notificacion al SO y obtiene el token unico de Expo Push (pushToken).
 * Este token se guarda en Firestore para poder enviar notificaciones a este usuario desde otros dispositivos.
 */
export async function registrarTokenEnFirestore(uid: string) {
  if (Platform.OS === 'web') return null;

  if (!Device.isDevice) {
    console.warn('Debe ser un dispositivo fisico para recibir notificaciones push');
    return null;
  }

  await ensureNotificationChannelConfigured();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permiso de notificaciones denegado');
    return null;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: 'db438c91-21eb-4020-a3ad-efec69cef405',
    })
  ).data;

  console.log('Expo Push Token:', token);

  const db = getFirestoreDb();
  if (db) {
    await updateDoc(doc(db, 'usuarios', uid), {
      pushToken: token,
    });
  }

  return token;
}

/**
 * Envia una notificacion push directamente a la API de Expo.
 * @param expoPushToken El token del destinatario.
 * @param title Titulo del mensaje.
 * @param body Cuerpo del mensaje.
 * @param data Datos extra para manejar navegacion al pulsar la notificacion.
 */
export async function enviarNotificacionPush(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any,
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    priority: 'high' as const,
    channelId: DEFAULT_NOTIFICATION_CHANNEL_ID,
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
 * BUSCA Y NOTIFICA:
 * Recupera automaticamente el token de un usuario desde Firestore y le envia el mensaje.
 * @param uid UID del destinatario.
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
