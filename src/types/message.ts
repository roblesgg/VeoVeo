export type MessageType = 'text' | 'match_invite' | 'match_result';

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: MessageType;
  timestamp: number;
  matchId?: string; // Si es un invite o resultado de match
};
