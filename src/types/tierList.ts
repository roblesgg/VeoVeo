export type TierList = {
  id: string;
  nombre: string;
  descripcion: string;
  creadorUid: string;
  fechaCreacion: number;
  ultimaModificacion: number;
  tierObraMaestra: number[];
  tierMuyBuena: number[];
  tierBuena: number[];
  tierMala: number[];
  tierNefasta: number[];
  publica: boolean;
  portadaUrl?: string;
};

export function nuevaTierListVacia(): TierList {
  return {
    id: '',
    nombre: '',
    descripcion: '',
    creadorUid: '',
    fechaCreacion: Date.now(),
    ultimaModificacion: Date.now(),
    tierObraMaestra: [],
    tierMuyBuena: [],
    tierBuena: [],
    tierMala: [],
    tierNefasta: [],
    publica: false,
    portadaUrl: undefined,
  };
}

export function todasLasPeliculasTierList(t: TierList): number[] {
  return [
    ...t.tierObraMaestra,
    ...t.tierMuyBuena,
    ...t.tierBuena,
    ...t.tierMala,
    ...t.tierNefasta,
  ];
}
