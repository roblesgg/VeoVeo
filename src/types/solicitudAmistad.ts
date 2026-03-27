export type SolicitudAmistad = {
  id: string;
  deUid: string;
  paraUid: string;
  deUsername: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fecha: number;
};
