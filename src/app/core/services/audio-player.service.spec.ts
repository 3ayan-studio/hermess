import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioPlayerService } from './audio-player.service';
import { Carre } from '../models/carre.model';

const mockCarre: Carre = {
    id: 'carre-laures',
    slug: 'carre-laures',
    title: "L'Aurès",
    subtitle: 'Édition 2026',
    ref: 'H001',
    priceFormatted: '495 €',
    colorName: 'Blanc / Noir',
    year: 2026,
    artist: 'Fatima-Marwa Zouzal',
    dimensions: '90 x 90 cm',
    composition: '100 % soie',
    careInstructions: ['Nettoyage à sec'],
    description: 'Description test',
    artisticNote: 'Note artistique',
    media: [{ id: 'm1', type: 'image', url: 'image.jpg', alt: 'Carré Parachute' }],
    carouselMedia: { id: 'c1', type: 'image', url: 'image.jpg', alt: 'Carré Parachute' },
    thumbnail: 'thumb.jpg',
    hasInterview: true,
    interview: {
        audioUrl: 'https://example.com/audio.mp3',
        durationSeconds: 1800,
        durationFormatted: '00:30:00',
        title: 'Échange avec Fatima',
        interviewees: ['Fatima-Marwa Zouzal'],
        synopsis: 'Synopsis test',
        transcript: [
            {
                id: 't1',
                timestampSeconds: 0,
                timestampFormatted: '00:00:00',
                speaker: 'Fatima',
                text: 'Première phrase'
            },
            {
                id: 't2',
                timestampSeconds: 30,
                timestampFormatted: '00:00:30',
                speaker: 'Habib',
                text: 'Deuxième phrase'
            }
        ]
    }
};

describe('AudioPlayerService', () => {
    let service: AudioPlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AudioPlayerService]
        });
        service = TestBed.inject(AudioPlayerService);
    });

    it('should initialize with default states', () => {
        expect(service.isPlaying()).toBe(false);
        expect(service.currentTime()).toBe(0);
        expect(service.currentCarre()).toBeNull();
        expect(service.isExchangePlayerInViewport()).toBe(false);
    });

    it('should reset state completely when closePlayer is called', () => {
        service.currentCarre.set(mockCarre);
        service.isPlaying.set(true);
        service.currentTime.set(120);
        service.duration.set(1800);
        service.setExchangePlayerInViewport(true);

        service.closePlayer();

        expect(service.isPlaying()).toBe(false);
        expect(service.currentTime()).toBe(0);
        expect(service.duration()).toBe(0);
        expect(service.currentCarre()).toBeNull();
        expect(service.isExchangePlayerInViewport()).toBe(false);
    });

    it('should update isExchangePlayerInViewport when setExchangePlayerInViewport is called', () => {
        expect(service.isExchangePlayerInViewport()).toBe(false);
        service.setExchangePlayerInViewport(true);
        expect(service.isExchangePlayerInViewport()).toBe(true);
        service.setExchangePlayerInViewport(false);
        expect(service.isExchangePlayerInViewport()).toBe(false);
    });

    it('should calculate progress percentage accurately', () => {
        service.duration.set(200);
        service.currentTime.set(50);
        expect(service.progressPercentage()).toBe(25);
    });

    it('should format time correctly', () => {
        service.currentTime.set(3665); // 1h 1m 5s
        expect(service.formattedCurrentTime()).toBe('01:01:05');
    });

    it('should toggle mute state when toggleMute is called', () => {
        expect(service.isMuted()).toBe(false);
        service.toggleMute();
        expect(service.isMuted()).toBe(true);
        service.toggleMute();
        expect(service.isMuted()).toBe(false);
    });

    it('should set and unmute state explicitly', () => {
        service.setMuted(true);
        expect(service.isMuted()).toBe(true);
        service.unmute();
        expect(service.isMuted()).toBe(false);
    });

    it('should increment autoFollowRequested when requestAutoFollow is called', () => {
        expect(service.autoFollowRequested()).toBe(0);
        service.requestAutoFollow();
        expect(service.autoFollowRequested()).toBe(1);
        service.requestAutoFollow();
        expect(service.autoFollowRequested()).toBe(2);
    });

    it('should stop playback, reset currentTime and clear currentCarre when stop is called', () => {
        service.currentCarre.set(mockCarre);
        service.isPlaying.set(true);
        service.currentTime.set(45);
        service.duration.set(1800);

        service.stop();

        expect(service.isPlaying()).toBe(false);
        expect(service.currentTime()).toBe(0);
        expect(service.duration()).toBe(0);
        expect(service.currentCarre()).toBeNull();
    });

    it('should pause playback when pause is called', () => {
        service.isPlaying.set(true);
        service.pause();
        expect(service.isPlaying()).toBe(false);
    });

    it('should set carre and seek time when playFromTime is called', () => {
        service.playFromTime(mockCarre, 60);

        expect(service.currentCarre()?.id).toBe(mockCarre.id);
        expect(service.currentTime()).toBe(60);
    });
});

