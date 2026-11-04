import { TranscriptSegment } from './transcript.model';

export interface TranscriptEntry {
  id: string;
  timestampSeconds: number;
  timestampFormatted: string; // "00:00:15", "00:05:42"
  speaker: string;
  speakerRole?: string;
  text: string;
}

export interface CarreInterview {
  audioUrl: string;
  transcriptUrl?: string; // Ex: "/carres/carre-laures/segmented-transcript.json"
  durationSeconds: number; // Ex: 1840 (environ 30 min) à 7200 (2h)
  durationFormatted: string; // "00:30:40"
  title: string;
  interviewees: string[];
  interviewer?: string;
  synopsis: string;
  transcript?: TranscriptEntry[];
}

export interface CarreImage {
  url: string;
  alt: string;
  isMain?: boolean;
  aspectRatio?: '1:1' | '3:4';
}

export interface Carre {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  ref: string;
  priceFormatted: string;
  colorName: string;
  year: number;
  artist: string;
  dimensions: string; // Ex: "90 x 90 cm"
  composition: string; // Ex: "100 % soie de mûrier roulotté à la main"
  textile?: string;
  technique?: string;
  exchangeNotes?: string;
  careInstructions: string[];
  description: string;
  artisticNote: string;
  images: CarreImage[];
  thumbnail: string;
  hasInterview: boolean;
  interview?: CarreInterview;
}
