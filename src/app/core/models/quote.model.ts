export type QuoteType = 'audio' | 'artwork';

export interface AudioQuote {
  id: string;
  type?: QuoteType;
  quote: string;
  carreTitle: string;
  speaker?: string;
  speakerRole?: string;

  // Spécifique aux extraits audio (optionnels pour type === 'artwork')
  carreSlug?: string;
  segmentId?: string;
  timestampSeconds?: number;
  timestampFormatted?: string; // "00:00:16"

  // Redirection personnalisée (ex: '/her-story-her-mess' pour le texte de l'œuvre)
  routeUrl?: string;
}


