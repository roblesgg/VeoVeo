/** Igual que model/PeliculaUsuario.kt */
export type PeliculaUsuario = {
  idPelicula: number;
  titulo: string;
  rutaPoster: string | null;
  estado: 'por_ver' | 'vista';
  valoracion: number;
  fechaAnadido: number;
  fechaLanzamiento?: string; // YYYY-MM-DD
  fechaVisto?: number; // timestamp
  providers?: {
    flatrate: number[];
    rent: number[];
  };
};
