import { describe, it, expect } from 'vitest';
import { findActiveSegmentIndex } from './binary-search';
import { TranscriptSegment } from '../models/transcript.model';

describe('findActiveSegmentIndex', () => {
  const mockSegments: TranscriptSegment[] = [
    { id: 'seg-0', speaker: 'S1', start: 0.0, end: 5.0, text: 'Premier segment' },
    { id: 'seg-1', speaker: 'S2', start: 5.5, end: 10.0, text: 'Deuxième segment' },
    { id: 'seg-2', speaker: 'S1', start: 10.0, end: 20.0, text: 'Troisième segment' },
    { id: 'seg-3', speaker: 'S2', start: 22.0, end: 30.0, text: 'Quatrième segment' }
  ];

  it('should return -1 when segments array is empty', () => {
    expect(findActiveSegmentIndex([], 5.0)).toBe(-1);
  });

  it('should return -1 when currentTime is negative', () => {
    expect(findActiveSegmentIndex(mockSegments, -1)).toBe(-1);
  });

  it('should find the initial segment at 0s', () => {
    expect(findActiveSegmentIndex(mockSegments, 0.0, -1)).toBe(0);
    expect(findActiveSegmentIndex(mockSegments, 2.5, -1)).toBe(0);
  });

  it('should use fast-path O(1) when within the same segment', () => {
    expect(findActiveSegmentIndex(mockSegments, 3.0, 0)).toBe(0);
    expect(findActiveSegmentIndex(mockSegments, 4.9, 0)).toBe(0);
  });

  it('should use sequential step O(1) when moving forward', () => {
    expect(findActiveSegmentIndex(mockSegments, 6.0, 0)).toBe(1);
    expect(findActiveSegmentIndex(mockSegments, 12.0, 1)).toBe(2);
  });

  it('should correctly handle silence gaps between segments', () => {
    // 5.2s est entre seg-0 (end 5.0) et seg-1 (start 5.5)
    // Avec keepActiveInGap = true, garde seg-0
    expect(findActiveSegmentIndex(mockSegments, 5.2, 0, true)).toBe(0);
    // Avec keepActiveInGap = false, retourne -1
    expect(findActiveSegmentIndex(mockSegments, 5.2, 0, false)).toBe(-1);
  });

  it('should perform binary search on large seek backward and forward', () => {
    // Seek vers l'avant à 25s
    expect(findActiveSegmentIndex(mockSegments, 25.0, 0)).toBe(3);
    // Seek vers l'arrière à 1s
    expect(findActiveSegmentIndex(mockSegments, 1.0, 3)).toBe(0);
  });

  it('should handle 2,500 segments at 60fps with exceptional performance', () => {
    const largeSegments: TranscriptSegment[] = [];
    for (let i = 0; i < 2500; i++) {
      largeSegments.push({
        id: `seg-${i}`,
        speaker: i % 2 === 0 ? 'S1' : 'S2',
        start: i * 3.0,
        end: i * 3.0 + 2.8,
        text: `Segment ${i}`
      });
    }

    const startTime = performance.now();
    let currentIndex = 0;

    // Simule 10 000 ticks séquentiels et aléatoires
    let lastFound = 0;
    for (let tick = 0; tick < 10000; tick++) {
      const time = (tick % 7500);
      currentIndex = findActiveSegmentIndex(largeSegments, time, currentIndex);
      if (currentIndex >= 0) lastFound++;
    }

    const duration = performance.now() - startTime;
    expect(lastFound).toBe(10000);
    // 10 000 lookups doivent prendre moins de 300ms (soit < 0.03ms par appel sous JSDOM)
    expect(duration).toBeLessThan(300);
  });
});
