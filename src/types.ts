export type Review = {
  id: string;
  book: string;
  author: string;
  rank: string;
  review: string;
  reader: string;
  genre: string;
  date: Date | null;
  rawDate: string;
  sourceUrl?: string;
};

export type BookGroup = {
  key: string;
  book: string;
  author: string;
  reviews: Review[];
  count: number;
  avgScore: number;
  latest: number; // ms timestamp of the most recent review (0 if unknown)
  genres: string[]; // distinct genres (catalog sheet first, else reviews)
  summary?: string;
  catalogUrl?: string;
};
