import { UsuarioPerfil } from './usuario';

export type ChatType = 'individual' | 'group';

export type Chat = {
  id: string;
  type: ChatType;
  participants: string[]; // UIDs
  participantDetails?: { [uid: string]: Partial<UsuarioPerfil> };
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
  };
  createdAt: number;
  name?: string; // Solo para grupos
  groupIcon?: string; // Solo para grupos
};
