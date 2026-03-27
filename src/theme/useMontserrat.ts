import { useFonts, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';

/** Equivalente a montserrat_alternates_semibold en Compose (Montserrat Semibold). */
export function useMontserrat() {
  const [loaded] = useFonts({ Montserrat_600SemiBold });
  return { loaded, fontFamily: 'Montserrat_600SemiBold' as const };
}
