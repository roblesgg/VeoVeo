/**
 * ARCHIVO: utils/shareUtils.ts
 * DESCRIPCIÓN: Utilidades para compartir contenido de la App en redes sociales.
 * Genera enlaces universales que funcionan tanto como Deep Links (abrir la app)
 * como enlaces web estándar.
 */

import { Share, Platform } from 'react-native';

const BASE_URL = 'https://veoveo.dripdev.dev';

/**
 * Comparte una película específica.
 * @param movieId ID de la película en TMDB.
 * @param title Título de la película para el mensaje.
 */
export const shareMovie = async (movieId: number, title: string) => {
  const url = `${BASE_URL}/movie/${movieId}`;
  const message = `¡Mira esta película en VeoVeo! 🍿\n\n*${title}*\n\n${url}`;

  try {
    await Share.share({
      message,
      // En iOS, el campo 'url' es necesario para activar el preview de la tarjeta
      url: Platform.OS === 'ios' ? url : undefined,
      title: `Compartir: ${title}`,
    });
  } catch (error) {
    // Manejo silencioso: la mayoría de fallos son cancelaciones del usuario
  }
};

/**
 * Comparte la ficha de un actor.
 * @param actorId ID del actor en TMDB.
 * @param name Nombre del actor.
 */
export const shareActor = async (actorId: number, name: string) => {
  const url = `${BASE_URL}/actor/${actorId}`;
  const message = `Mira todo sobre *${name}* en VeoVeo 🎬\n\n${url}`;

  try {
    await Share.share({
      message,
      url: Platform.OS === 'ios' ? url : undefined,
      title: `Compartir: ${name}`,
    });
  } catch (error) {
    // Manejo silencioso
  }
};
