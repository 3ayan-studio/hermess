import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  QuotesDataService,
  extractQuoteFromSegment,
  stripHtmlTags
} from './quotes-data.service';
import { TranscriptService } from './transcript.service';
import { SegmentedTranscript } from '../models/transcript.model';
import { AUDIO_QUOTES_MOCK } from '../data/quotes.mock';

describe('QuotesDataService', () => {
  let service: QuotesDataService;
  let transcriptService: TranscriptService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuotesDataService, TranscriptService]
    });
    transcriptService = TestBed.inject(TranscriptService);
  });

  it('should initialize with default audio quotes', () => {
    service = TestBed.inject(QuotesDataService);
    const quotes = service.quotes();
    expect(quotes.length).toBe(AUDIO_QUOTES_MOCK.length);
    expect(quotes[0].id).toBe('quote-laures-1');
    expect(service.getQuotes()).toEqual(quotes);
  });

  it('should find a quote by id', () => {
    service = TestBed.inject(QuotesDataService);
    const found = service.getQuoteById('quote-1954-1962-1');
    expect(found).toBeDefined();
    expect(found?.carreSlug).toBe('carre-1954-1962');

    const notFound = service.getQuoteById('non-existent');
    expect(notFound).toBeUndefined();
  });

  describe('extractQuoteFromSegment', () => {
    it('should strip HTML tags correctly', () => {
      expect(stripHtmlTags('Texte avec <i>italique</i> et <em>accent</em>')).toBe(
        'Texte avec italique et accent'
      );
      expect(stripHtmlTags('')).toBe('');
    });

    it('should extract matching substring and preserve HTML tags from segment text', () => {
      const segText =
        'Et je me souviens d’un soir où ma mère a rassemblé nos affaires. Je lui ai dit : <i>« Maman, où va-t-on ? »</i> Elle m’a répondu : <em>« La France nous chasse de nos montagnes, il faut que l’on parte d’ici. »</em>';
      const mockQuote =
        'Je lui ai dit : « Maman, où va-t-on ? » Elle m’a répondu : « La France nous chasse de nos montagnes, il faut que l’on parte d’ici. »';

      const result = extractQuoteFromSegment(mockQuote, segText);
      expect(result).toBe(
        'Je lui ai dit : <i>« Maman, où va-t-on ? »</i> Elle m’a répondu : <em>« La France nous chasse de nos montagnes, il faut que l’on parte d’ici. »</em>'
      );
      expect(result).toContain('<i>« Maman, où va-t-on ? »</i>');
      expect(result).toContain('<em>« La France nous chasse de nos montagnes, il faut que l’on parte d’ici. »</em>');
    });

    it('should return segmentText directly when clean mock is equal to clean segment', () => {
      const segText = 'Dans les <em>Aurès</em>.';
      const mockQuote = 'Dans les Aurès.';
      expect(extractQuoteFromSegment(mockQuote, segText)).toBe('Dans les <em>Aurès</em>.');
    });

    it('should handle ellipses in mock quote', () => {
      const segText =
        'En 1955, je commençais à comprendre qu’il y avait une guerre, tout ça. On était dans les montagnes des <em>Aurès</em>.';
      const mockQuote =
        'En 1955, je commençais à comprendre qu’il y avait une guerre... On était dans les montagnes des Aurès.';

      const result = extractQuoteFromSegment(mockQuote, segText);
      expect(result).toContain('<em>Aurès</em>');
    });

    it('should fallback to segmentText if no matching substring is found', () => {
      const segText = 'Récit complètement réécrit.';
      const mockQuote = 'Ancien texte qui n’existe plus.';
      expect(extractQuoteFromSegment(mockQuote, segText)).toBe('Récit complètement réécrit.');
    });
  });

  describe('hydrateQuotesFromTranscripts', () => {
    it('should dynamically update quotes with tags from loaded transcript', async () => {
      const mockTranscript: SegmentedTranscript = {
        metadata: {
          speakers: { S1: 'Témoin' }
        },
        segments: [
          {
            id: 'seg-3',
            speaker: 'S1',
            start: 16.0,
            end: 36.0,
            text: 'Et je me souviens d’un soir. Je lui ai dit : <i>« Maman, où va-t-on ? »</i> Elle m’a répondu : <em>« La France nous chasse de nos montagnes, il faut que l’on parte d’ici. »</em>'
          }
        ]
      };

      vi.spyOn(transcriptService, 'loadTranscript').mockImplementation(async (slug) => {
        if (slug === 'carre-laures') {
          return mockTranscript;
        }
        return null;
      });

      service = TestBed.inject(QuotesDataService);
      await service.hydrateQuotesFromTranscripts();

      const lauresQuote = service.getQuoteById('quote-laures-1');
      expect(lauresQuote?.quote).toContain('<i>« Maman, où va-t-on ? »</i>');
      expect(lauresQuote?.quote).toContain('<em>« La France nous chasse de nos montagnes, il faut que l’on parte d’ici. »</em>');
    });

    it('should gracefully keep existing quote if transcript loading fails', async () => {
      vi.spyOn(transcriptService, 'loadTranscript').mockRejectedValue(new Error('Network error'));

      service = TestBed.inject(QuotesDataService);
      await service.hydrateQuotesFromTranscripts();

      const quotes = service.quotes();
      expect(quotes.length).toBe(AUDIO_QUOTES_MOCK.length);
      expect(quotes[0].id).toBe('quote-laures-1');
    });

    it('should leave artwork text quotes unchanged during hydration', async () => {
      service = TestBed.inject(QuotesDataService);
      await service.hydrateQuotesFromTranscripts();

      const artworkQuote = service.getQuoteById('quote-artwork-1');
      expect(artworkQuote).toBeDefined();
      expect(artworkQuote?.type).toBe('artwork');
      expect(artworkQuote?.routeUrl).toBe('/her-story-her-mess');
      expect(artworkQuote?.quote).toContain('Les récits sont, pour la plupart, difficiles à entendre');
    });
  });
});

