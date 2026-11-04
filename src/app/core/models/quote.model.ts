export interface AudioQuote {
  id: string;
  carreSlug: string;
  carreTitle: string;
  segmentId: string;
  timestampSeconds: number;
  timestampFormatted: string; // "00:00:16"
  quote: string;
  speaker: string;
  speakerRole?: string;
}

