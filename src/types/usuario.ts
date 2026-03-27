/** Alineado con model/Usuario.kt + campos opcionales en Firestore */
export type UsuarioPerfil = {
  uid: string;
  username: string;
  email: string;
  fotoPerfil: string | null;
  amigos: string[];
  fechaCreacion?: number;
  bloqueados?: string[];
  estado?: 'online' | 'offline' | 'ausente';
  ultimoAcceso?: number;
};
