export interface TranscriptSpeaker {
  name: string;
  role?: string;
}

export type TranscriptSpeakersMap = Record<string, TranscriptSpeaker | string>;
export type TranscriptSpeakersList = Array<{ id: string; name: string; role?: string }>;

export interface TranscriptMetadata {
  title?: string;
  language?: string;
  speakers: TranscriptSpeakersMap | TranscriptSpeakersList;
  duration?: number;
  [key: string]: unknown;
}

export interface TranscriptSegment {
  id: string;
  speaker: string; // Ex: "S1", "S2" ou nom direct
  start: number;   // Secondes décimales (float)
  end: number;     // Secondes décimales (float)
  text: string;
}

export interface SegmentedTranscript {
  metadata: TranscriptMetadata;
  segments: TranscriptSegment[];
}

