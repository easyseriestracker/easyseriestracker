
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  backgroundTheme?: string; // URL for profile background
  topFavorites: Show[]; // Limit to 3
  watchlist: WatchlistItem[];
  ratings: Record<number, number>; // showId: rating (1-5)
  lists: List[];
  settings: {
    tmdbKey?: string;
    language?: 'en' | 'tr';
    notificationsEnabled?: boolean;
  };
  joinedAt: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface List {
  id: string;
  name: string;
  description?: string;
  items: Show[];
  isPrivate: boolean;
  createdAt: string;
  userId: string; // Owner
  username: string;
  likes: string[];
  comments: ReviewReply[];
}

export interface WatchlistItem {
  showId: number;
  addedAt: string; // ISO Date
}

export interface Show {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
}

export interface CastMember {
  person: {
    name: string;
    image: { medium: string } | null;
  };
  character: {
    name: string;
  };
}

export interface ReviewReply {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  createdAt: string;
}

export interface Review {
  id: string;
  showId: number;
  showName: string;
  showPoster: string | null;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  rating: number;
  createdAt: string;
  likes: string[]; // Array of userIds
  replies: ReviewReply[];
}

export interface ShowDetails extends Show {
  number_of_seasons: number;
  number_of_episodes: number;
  next_episode_to_air: Episode | null;
  genres: { id: number; name: string }[];
  imdb_id?: string;
  cast: CastMember[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
}

export interface NotificationLog {
  [uniqueId: string]: number;
}
