/**
 * Misma lista y lógica que MainScreen.kt (carruselesDisponibles + obtenerIdGenero).
 */
export const CARRUSELES_DISPONIBLES: string[] = [
  'Tendencias Semanales',
  'Populares Ahora',
  'Estrenos en Cartelera',
  'Mejor Valoradas',
  'Joyas de los 80/90',
  'Clásicos de Oro',
  'Acción',
  'Animación',
  'Anime',
  'Aventura',
  'Bélica',
  'Ciencia Ficción',
  'Cine Negro',
  'Clásicas',
  'Comedia',
  'Comedia Romántica',
  'Crimen',
  'Documental',
  'Drama',
  'Espacio',
  'Familia',
  'Fantasía',
  'Historia',
  'Misterio',
  'Musical',
  'Música',
  'Películas de TV',
  'Policíaca',
  'Policial',
  'Romance',
  'Samuráis',
  'Superhéroes',
  'Suspense',
  'Terror',
  'Thriller Psicológico',
  'Western',
  'Zombis',
];

export type TipoCarrusel = 'GENERO' | 'TRENDING' | 'POPULAR' | 'NOW_PLAYING' | 'TOP_RATED' | 'DISCOVER';

export function obtenerConfiguracionCarrusel(titulo: string): { tipo: TipoCarrusel; payload: string } {
  if (titulo === 'Tendencias Semanales') return { tipo: 'TRENDING', payload: 'week' };
  if (titulo === 'Populares Ahora') return { tipo: 'POPULAR', payload: '' };
  if (titulo === 'Estrenos en Cartelera') return { tipo: 'NOW_PLAYING', payload: '' };
  if (titulo === 'Mejor Valoradas') return { tipo: 'TOP_RATED', payload: '' };
  if (titulo === 'Joyas de los 80/90') return { tipo: 'DISCOVER', payload: 'primary_release_date.gte=1980-01-01&primary_release_date.lte=1999-12-31&vote_count.gte=1000&sort_by=popularity.desc' };
  if (titulo === 'Clásicos de Oro') return { tipo: 'DISCOVER', payload: 'primary_release_date.lte=1979-12-31&vote_count.gte=500&sort_by=vote_average.desc' };

  return { tipo: 'GENERO', payload: obtenerIdGenero(titulo) };
}

export function obtenerIdGenero(titulo: string): string {
  const t = titulo;
  if (t.includes('Acción') && !t.includes('Comedia')) return '28';
  if (t.includes('Aventura')) return '12';
  if (t.includes('Anime')) return '16';
  if (t.includes('Animación')) return '16';
  if (t.includes('Bélica') || t.includes('Guerra')) return '10752';
  if (t.includes('Ciencia Ficción') || t.includes('Sci-Fi')) return '878';
  if (t.includes('Cine Negro')) return '80';
  if (t.includes('Clásicas')) return '36,18';
  if (t.includes('Comedia Romántica')) return '10749,35';
  if (t.includes('Comedia')) return '35';
  if (t.includes('Crimen')) return '80';
  if (t.includes('Documental')) return '99';
  if (t.includes('Drama')) return '18';
  if (t.includes('Espacio')) return '878,12';
  if (t.includes('Familia')) return '10751';
  if (t.includes('Fantasía')) return '14';
  if (t.includes('Historia')) return '36';
  if (t.includes('Películas de TV') || t.includes('TV')) return '10770';
  if (t.includes('Policial') || t.includes('Policíaca')) return '80,53';
  if (t.includes('Misterio')) return '9648';
  if (t.includes('Musical')) return '10402';
  if (t.includes('Música')) return '10402';
  if (t.includes('Romance')) return '10749';
  if (t.includes('Samuráis')) return '28,36';
  if (t.includes('Superhéroes')) return '28,14,878';
  if (t.includes('Thriller Psicológico')) return '53,9648';
  if (t.includes('Suspense') || t.includes('Thriller')) return '53';
  if (t.includes('Terror')) return '27';
  if (t.includes('Western')) return '37';
  if (t.includes('Zombis')) return '27,53';
  return '28';
}
