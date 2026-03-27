import AsyncStorage from '@react-native-async-storage/async-storage';

/** Misma clave lógica que PreferencesHelper (SharedPreferences "carruseles_activos"). */
const KEY_CARRUSELES_ACTIVOS = 'carruseles_activos';
const KEY_INCLUIR_ADULTO = 'incluir_adulto';
const KEY_ORDEN_POR_VER = 'orden_por_ver';
const KEY_ORDEN_VISTAS = 'orden_vistas';
const KEY_PLATAFORMAS = 'mis_plataformas';

export const DEFAULT_CARRUSELES = [
  'Tendencias Semanales',
  'Estrenos en Cartelera',
  'Interesante para ti',
  'Populares Ahora',
  'Joyas de los 80/90',
  'Mejor Valoradas',
  'Cine de los 70',
  'Acción y Pura Adrenalina'
];

export async function cargarPreferenciaAdulto(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEY_INCLUIR_ADULTO);
    return val === 'true'; // Default false
  } catch {
    return false;
  }
}

export async function guardarPreferenciaAdulto(incluir: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY_INCLUIR_ADULTO, incluir ? 'true' : 'false');
}

export async function cargarCarruselesActivos(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_CARRUSELES_ACTIVOS);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_CARRUSELES];
}

export async function guardarCarruselesActivos(carruseles: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY_CARRUSELES_ACTIVOS, JSON.stringify(carruseles));
}

export async function cargarOrdenBiblioteca(tipo: 'vistas' | 'por_ver'): Promise<string> {
  const key = tipo === 'vistas' ? KEY_ORDEN_VISTAS : KEY_ORDEN_POR_VER;
  return (await AsyncStorage.getItem(key)) || 'recientes';
}

export async function guardarOrdenBiblioteca(tipo: 'vistas' | 'por_ver', orden: string): Promise<void> {
  const key = tipo === 'vistas' ? KEY_ORDEN_VISTAS : KEY_ORDEN_POR_VER;
  await AsyncStorage.setItem(key, orden);
}

export async function cargarPlataformas(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PLATAFORMAS);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

export async function guardarPlataformas(plataformas: string[]): Promise<void> {
  console.log('--- SAVING PLATFORMS:', plataformas);
  await AsyncStorage.setItem(KEY_PLATAFORMAS, JSON.stringify(plataformas));
}
