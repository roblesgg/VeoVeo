/**
 * ARCHIVO: services/notificationService.ts
 * DESCRIPCIÓN: Gestiona el sistema de notificaciones push de la aplicación utilizando Expo Notifications.
 * Incluye el registro del dispositivo, obtención de tokens y envío de notificaciones entre usuarios.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

/**
 * CONFIGURACIÓN GLOBAL: Comportamiento cuando llega una notificación.
 * Aquí definimos que siempre se muestre la alerta, suene y actualice el badge.
 */
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
 * Solicita permisos de notificación al SO y obtiene el token único de Expo Push (pushToken).
 * Este token se guarda en Firestore para poder enviar notificaciones a este usuario desde otros dispositivos.
 */
export async function registrarTokenEnFirestore(uid: string) {
  // Las notificaciones push nativas no funcionan igual en Web, se omite por ahora.
  if (Platform.OS === 'web') return null; 
  
  if (!Device.isDevice) {
    console.warn('Debe ser un dispositivo físico para recibir notificaciones push');
    return null;
  }

  // Comprobar y/o solicitar permisos
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

  // Obtener el token de Expo
  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: 'db438c91-21eb-4020-a3ad-efec69cef405' // ID del proyecto en el dashboard de Expo
  })).data;

  console.log('📬 Expo Push Token:', token);

  // Guardar el token en el perfil del usuario en Firestore
  const db = getFirestoreDb();
  if (db) {
    await updateDoc(doc(db, 'usuarios', uid), {
      pushToken: token
    });
  }

  // Configuración de canales para Android (Requerido para Oreo+)
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
 * Envía una notificación push directamente a la API de Expo.
 * @param expoPushToken El token del destinatario.
 * @param title Título del mensaje.
 * @param body Cuerpo del mensaje.
 * @param data (Opcional) Datos extra para manejar navegación al pulsar la notificación.
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
 * BUSCA Y NOTIFICA:
 * Recupera automáticamente el token de un usuario desde Firestore y le envía el mensaje.
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
