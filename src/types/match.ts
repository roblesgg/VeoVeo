export type MatchStatus = 'active' | 'finished' | 'cancelled';

export type MovieMatch = {
  id: string;
  chatId: string;
  creatorId: string;
  participants: string[];
  status: MatchStatus;
  settings: {
    targetMatches: number;
    excludeSeen: boolean;
  };
  matchedMovies: number[]; // IDs de TMDB
  createdAt: number;
  finishedAt?: number;
};

export type PlayerVote = {
  uid: string;
  movieId: number;
  vote: 'yes' | 'no';
  timestamp: number;
};
