import { Share, Platform } from 'react-native';

const BASE_URL = 'https://veoveo-app-install.netlify.app/share';

/**
 * Genera un enlace universal que:
 * 1. Intenta abrir la app si está instalada (deep linking).
 * 2. Si no, muestra la web con botón de descarga.
 */
export const shareMovie = async (movieId: number, title: string) => {
  const url = `${BASE_URL}?type=movie&id=${movieId}`;
  const message = `¡Mira esta película en VeoVeo! 🍿\n\n*${title}*\n\n${url}`;
  
  try {
    await Share.share({
      message,
      url: Platform.OS === 'ios' ? url : undefined,
      title: `Compartir: ${title}`,
    });
  } catch (error) {
    // Error silencioso
  }
};

export const shareActor = async (actorId: number, name: string) => {
  const url = `${BASE_URL}?type=actor&id=${actorId}`;
  const message = `Mira todo sobre *${name}* en VeoVeo 🎬\n\n${url}`;
  
  try {
    await Share.share({
      message,
      url: Platform.OS === 'ios' ? url : undefined,
      title: `Compartir: ${name}`,
    });
  } catch (error) {
    // Error silencioso
  }
};
