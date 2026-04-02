export type MessageType = 'text' | 'movie' | 'match_invite' | 'match_result';

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: MessageType;
  timestamp: number | any;
  matchId?: string; // Si es un invite o resultado de match
  movieData?: {
    id: number;
    title: string;
    posterPath: string;
  };
};
