import { Platform } from 'react-native';
import { useFonts, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';

/** Equivalente a montserrat_alternates_semibold en Compose (Montserrat Semibold). */
export function useMontserrat() {
  const [loaded] = useFonts({ Montserrat_600SemiBold });
  // On web, include fallback fonts so iOS Safari shows Montserrat (from Google CDN)
  // instead of the UA serif default when the custom font hasn't loaded yet.
  // Comma-separated stacks are only valid in CSS (web), not on native.
  const fontFamily =
    Platform.OS === 'web'
      ? "Montserrat_600SemiBold, 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif"
      : 'Montserrat_600SemiBold';
  return { loaded, fontFamily };
}
