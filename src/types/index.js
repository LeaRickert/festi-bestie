export interface Festival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  image: string;
  description?: string;
}

export interface Act {
  id: string;
  artist: string;
  day: string;
  startTime: string;
  length: number; // in minutes
  stage: string;
  specialNotes?: string;
  genre: string;
  category: string;
  youtubeUrl?: string;
  youtubeTitle?: string;
  festivalId: string;
}

export interface UserRating {
  id: string;
  userId: string;
  actId: string;
  rating: number; // 0-5 scale with half-star precision
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface FilterOptions {
  day?: string;
  stage?: string;
  genre?: string;
  category?: string;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface SortOptions {
  field: 'artist' | 'startTime' | 'stage' | 'genre';
  direction: 'asc' | 'desc';
}
