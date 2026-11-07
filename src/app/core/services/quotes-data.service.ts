import { Injectable, inject, signal } from '@angular/core';
import { AudioQuote } from '../models/quote.model';
import { AUDIO_QUOTES_MOCK } from '../data/quotes.mock';
import { TranscriptService } from './transcript.service';

export function stripHtmlTags(text: string): string {
  return text ? text.replace(/<[^>]*>/g, '') : '';
}

export function extractSliceForPart(
  part: string,
  segmentText: string,
  fromIndex = 0
): { text: string; nextIndex: number } | null {
  const norm = (s: string) => s.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const normPart = norm(stripHtmlTags(part));
  if (!normPart) return null;

  let htmlStart = -1;
  let inTag = false;

  for (let i = fromIndex; i < segmentText.length; i++) {
    if (segmentText[i] === '<') {
      inTag = true;
      continue;
    }
    if (segmentText[i] === '>') {
      inTag = false;
      continue;
    }
    if (inTag) continue;

    if (norm(stripHtmlTags(segmentText.slice(i))).startsWith(normPart)) {
      htmlStart = i;
      break;
    }
  }

  if (htmlStart === -1) return null;

  let htmlEnd = -1;
  for (let i = htmlStart; i <= segmentText.length; i++) {
    const candidate = segmentText.substring(htmlStart, i);
    if (norm(stripHtmlTags(candidate)) === normPart) {
      htmlEnd = i;
      const rest = segmentText.substring(i);
      const tagMatch = rest.match(/^((<\/[a-zA-Z0-9]+>)+)/);
      if (tagMatch) {
        htmlEnd += tagMatch[1].length;
      }
      break;
    }
  }

  return htmlEnd !== -1
    ? { text: segmentText.substring(htmlStart, htmlEnd).trim(), nextIndex: htmlEnd }
    : null;
}

export function extractQuoteFromSegment(mockQuote: string, segmentText: string): string {
  if (!segmentText) return mockQuote;
  if (!mockQuote) return segmentText;

  const norm = (s: string) => s.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const cleanSeg = stripHtmlTags(segmentText);
  const cleanMock = stripHtmlTags(mockQuote);

  const normSeg = norm(cleanSeg);
  const normMock = norm(cleanMock);

  if (normSeg === normMock) {
    return segmentText;
  }

  // Si mockQuote a des points de suspension '...'
  if (mockQuote.includes('...')) {
    const rawParts = mockQuote.split('...').map(p => p.trim()).filter(Boolean);
    const matchedParts: string[] = [];
    let currentIndex = 0;

    for (const rawPart of rawParts) {
      const match = extractSliceForPart(rawPart, segmentText, currentIndex);
      if (match) {
        matchedParts.push(match.text);
        currentIndex = match.nextIndex;
      } else {
        matchedParts.push(rawPart);
      }
    }

    if (matchedParts.length > 0) {
      return matchedParts.join(' ... ');
    }
  }

  // Sous-chaîne directe
  const match = extractSliceForPart(mockQuote, segmentText, 0);
  if (match) {
    return match.text;
  }

  return segmentText;
}

@Injectable({
  providedIn: 'root'
})
export class QuotesDataService {
  private readonly transcriptService = inject(TranscriptService);
  private readonly _quotes = signal<AudioQuote[]>(AUDIO_QUOTES_MOCK);
  readonly quotes = this._quotes.asReadonly();

  constructor() {
    this.hydrateQuotesFromTranscripts();
  }

  getQuotes(): AudioQuote[] {
    return this._quotes();
  }

  getQuoteById(id: string): AudioQuote | undefined {
    return this._quotes().find(q => q.id === id);
  }

  /**
   * Charge asynchronement les fichiers segmented-transcript.json associés aux citations
   * et met à jour le texte des citations en préservant toutes les balises HTML (i, em, etc.).
   */
  async hydrateQuotesFromTranscripts(): Promise<void> {
    const currentQuotes = this._quotes();
    let hasChanges = false;

    const updated = await Promise.all(
      currentQuotes.map(async (q) => {
        if (q.type === 'artwork' || !q.carreSlug || !q.segmentId) {
          return q;
        }

        try {
          const transcript = await this.transcriptService.loadTranscript(q.carreSlug);
          if (!transcript || !Array.isArray(transcript.segments)) {
            return q;
          }

          const targetSeg = transcript.segments.find(s => s.id === q.segmentId);
          if (!targetSeg || !targetSeg.text) {
            return q;
          }

          const resolvedQuoteText = extractQuoteFromSegment(q.quote, targetSeg.text);
          if (resolvedQuoteText !== q.quote) {
            hasChanges = true;
            return {
              ...q,
              quote: resolvedQuoteText
            };
          }
        } catch {
          // Fallback silencieux sur la citation mock en cas d'erreur de chargement
        }

        return q;
      })
    );

    if (hasChanges) {
      this._quotes.set(updated);
    }
  }
}
