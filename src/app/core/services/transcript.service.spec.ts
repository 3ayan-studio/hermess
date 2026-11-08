import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TranscriptService } from './transcript.service';
import { SegmentedTranscript } from '../models/transcript.model';

describe('TranscriptService', () => {
    let service: TranscriptService;

    beforeEach(() => {
        service = new TranscriptService();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should correctly resolve speaker name from dictionary format', () => {
        const metadata = {
            speakers: {
                S1: { name: 'Fatima-Marwa Zouzal', role: 'Artiste' },
                S2: { name: 'Commissaire' },
                S3: 'Simple Nom'
            }
        };

        expect(service.resolveSpeakerName('S1', metadata)).toBe('Fatima-Marwa Zouzal');
        expect(service.resolveSpeakerName('S2', metadata)).toBe('Commissaire');
        expect(service.resolveSpeakerName('S3', metadata)).toBe('Simple Nom');
        expect(service.resolveSpeakerName('Unknown', metadata)).toBe('Unknown');
        expect(service.resolveSpeakerRole('S1', metadata)).toBe('Artiste');
        expect(service.resolveSpeakerRole('S2', metadata)).toBeUndefined();
    });

    it('should correctly resolve speaker name from array format', () => {
        const metadata = {
            speakers: [
                { id: 'S1', name: 'Fatima-Marwa Zouzal', role: 'Artiste' },
                { id: 'S2', name: 'Commissaire' }
            ]
        };

        expect(service.resolveSpeakerName('S1', metadata)).toBe('Fatima-Marwa Zouzal');
        expect(service.resolveSpeakerName('S2', metadata)).toBe('Commissaire');
        expect(service.resolveSpeakerName('Unknown', metadata)).toBe('Unknown');
        expect(service.resolveSpeakerRole('S1', metadata)).toBe('Artiste');
    });

    it('should load and cache transcript via fetch', async () => {
        const mockData: SegmentedTranscript = {
            metadata: { speakers: { S1: { name: 'Test' } } },
            segments: [{ id: '1', speaker: 'S1', start: 0, end: 5, text: 'Hello' }]
        };

        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => mockData
        } as Response);

        const result1 = await service.loadTranscript('carre-test');
        expect(result1).toEqual(mockData);
        expect(fetchSpy).toHaveBeenCalledTimes(1);

        // Second call should return cached result without calling fetch again
        const result2 = await service.loadTranscript('carre-test');
        expect(result2).toEqual(mockData);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors gracefully', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 404
        } as Response);

        const result = await service.loadTranscript('non-existent');
        expect(result).toBeNull();
    });
});

