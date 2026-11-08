import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AudioStickyBarComponent } from './audio-sticky-bar.component';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';
import { Carre } from '../../../../core/models/carre.model';

const mockCarre: Carre = {
    id: 'carre-test',
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
    images: [{ url: 'image.jpg', alt: "L'Aurès" }],
    thumbnail: 'thumb.jpg',
    hasInterview: true,
    interview: {
        audioUrl: 'https://example.com/audio.mp3',
        durationSeconds: 1800,
        durationFormatted: '00:30:00',
        title: 'Échange avec Fatima',
        interviewees: ['Fatima-Marwa Zouzal'],
        synopsis: 'Synopsis test',
        transcript: []
    }
};

describe('AudioStickyBarComponent', () => {
    let component: AudioStickyBarComponent;
    let fixture: ComponentFixture<AudioStickyBarComponent>;
    let audioService: AudioPlayerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AudioStickyBarComponent],
            providers: [AudioPlayerService]
        }).compileComponents();

        fixture = TestBed.createComponent(AudioStickyBarComponent);
        component = fixture.componentInstance;
        audioService = TestBed.inject(AudioPlayerService);
        fixture.componentRef.setInput('carre', mockCarre);
        fixture.detectChanges();
    });

    it('should create and generate 250 fine waveform bars', () => {
        expect(component).toBeTruthy();
        expect(component.bars().length).toBe(250);
    });

    it('should synchronize exchange player in viewport state with audioService', () => {
        // 1. Initialement : non visible
        expect(audioService.isExchangePlayerInViewport()).toBe(false);

        // 2. Carre actif mais hors du viewport
        audioService.currentCarre.set(mockCarre);
        component.isInViewport.set(false);
        fixture.detectChanges();
        expect(audioService.isExchangePlayerInViewport()).toBe(false);

        // 3. Carre actif et entrant dans le viewport -> devient true
        component.isInViewport.set(true);
        fixture.detectChanges();
        expect(audioService.isExchangePlayerInViewport()).toBe(true);

        // 4. Un autre carré joue -> redevient false
        const anotherCarre: Carre = {
            ...mockCarre,
            id: 'carre-autre',
            slug: 'autre-slug'
        };
        audioService.currentCarre.set(anotherCarre);
        fixture.detectChanges();
        expect(audioService.isExchangePlayerInViewport()).toBe(false);

        // 5. Retour sur ce carre -> redevient true
        audioService.currentCarre.set(mockCarre);
        fixture.detectChanges();
        expect(audioService.isExchangePlayerInViewport()).toBe(true);

        // 6. Sortie du viewport -> redevient false
        component.isInViewport.set(false);
        fixture.detectChanges();
        expect(audioService.isExchangePlayerInViewport()).toBe(false);
    });

    it('should calculate hoverSvgWidth and hoverTimeFormatted on mouse move', () => {
        audioService.currentCarre.set(mockCarre);
        component.hoverPercentage.set(50); // 50%
        audioService.duration.set(1800); // 30 min
        fixture.detectChanges();

        expect(component.hoverSvgWidth()).toBe(500);
        expect(component.hoverTimeFormatted()).toBe('00:15:00');
    });

    it('should calculate progressSvgWidth proportional to percentage when current carre is active', () => {
        audioService.currentCarre.set(mockCarre);
        audioService.duration.set(100);
        audioService.currentTime.set(30); // 30%
        fixture.detectChanges();

        // 30% of 1000 = 300
        expect(component.progressSvgWidth()).toBeCloseTo(300, 0);
    });

    it('should remain inactive when another carre audio is playing', () => {
        const anotherCarre: Carre = {
            ...mockCarre,
            id: 'carre-autre',
            slug: 'autre-slug',
            title: 'Autre Carré'
        };

        audioService.currentCarre.set(anotherCarre);
        audioService.isPlaying.set(true);
        audioService.currentTime.set(450);
        audioService.duration.set(1200);
        fixture.detectChanges();

        expect(component.isCurrentCarre()).toBe(false);
        expect(component.isCurrentPlaying()).toBe(false);
        expect(component.progressSvgWidth()).toBe(0);
        expect(component.displayCurrentTime()).toBe('00:00:00');
        expect(component.displayDuration()).toBe('00:30:00');

        const compiled = fixture.nativeElement as HTMLElement;
        const dot = compiled.querySelector('.status-indicator-dot');
        expect(dot?.classList.contains('is-playing')).toBe(false);

        const playBtn = compiled.querySelector('.play-btn');
        expect(playBtn?.getAttribute('aria-label')).toBe('Lancer la lecture');
        expect(playBtn?.querySelector('.play-icon-offset')).toBeTruthy();
    });

    it('should become active when this carre audio is playing', () => {
        audioService.currentCarre.set(mockCarre);
        audioService.isPlaying.set(true);
        audioService.currentTime.set(60);
        audioService.duration.set(1800);
        fixture.detectChanges();

        expect(component.isCurrentCarre()).toBe(true);
        expect(component.isCurrentPlaying()).toBe(true);
        expect(component.displayCurrentTime()).toBe('00:01:00');
        expect(component.displayDuration()).toBe('00:30:00');

        const compiled = fixture.nativeElement as HTMLElement;
        const dot = compiled.querySelector('.status-indicator-dot');
        expect(dot?.classList.contains('is-playing')).toBe(true);

        const playBtn = compiled.querySelector('.play-btn');
        expect(playBtn?.getAttribute('aria-label')).toBe('Mettre en pause');
        expect(playBtn?.querySelector('rect')).toBeTruthy();
    });

    it('should toggle play/pause when onPlayPause is called', () => {
        audioService.currentCarre.set(mockCarre);
        expect(audioService.isPlaying()).toBe(false);

        component.onPlayPause();
        // AudioPlayerService.togglePlay called
        expect(audioService.currentCarre()?.id).toBe(mockCarre.id);
    });

    it('should call stop on audioService when onStop is called', () => {
        audioService.currentCarre.set(mockCarre);
        audioService.isPlaying.set(true);
        audioService.currentTime.set(45);

        component.onStop();

        expect(audioService.isPlaying()).toBe(false);
        expect(audioService.currentTime()).toBe(0);
    });

    it('should toggle mute on audioService when onToggleMute is called', () => {
        expect(audioService.isMuted()).toBe(false);
        component.onToggleMute();
        expect(audioService.isMuted()).toBe(true);
        component.onToggleMute();
        expect(audioService.isMuted()).toBe(false);
    });

    it('should skip deltaSeconds when onSkip is called', () => {
        audioService.currentCarre.set(mockCarre);
        audioService.duration.set(100);
        audioService.currentTime.set(30);

        component.onSkip(10);
        expect(audioService.currentTime()).toBe(40);

        component.onSkip(-10);
        expect(audioService.currentTime()).toBe(30);
    });

    it('should render the track title and not render the interview subtitle', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const title = compiled.querySelector('.track-title');
        const subtitle = compiled.querySelector('.track-subtitle');

        expect(title?.textContent?.trim()).toBe("L'Aurès");
        expect(subtitle).toBeNull();
    });

    describe('Audio Disclaimer Blurred Overlay', () => {
        it('should show the disclaimer overlay by default when not playing', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const overlay = compiled.querySelector('.audio-disclaimer-overlay');
            expect(overlay).toBeTruthy();
            expect(overlay?.classList.contains('is-hidden')).toBe(false);

            expect(overlay?.textContent).toContain('Contenu sensible :');
            expect(overlay?.textContent).toContain('Cet enregistrement et sa transcription comportent des récits éprouvants.');

            const icon = overlay?.querySelector('svg.warning-icon');
            expect(icon).toBeTruthy();

            const cta = overlay?.querySelector('.disclaimer-cta-btn');
            expect(cta).toBeTruthy();
            expect(cta?.textContent).toContain('Écouter');
        });

        it('should hide the overlay and start playback when CTA is clicked', () => {
            const playSpy = vi.spyOn(audioService, 'playCarre');
            const compiled = fixture.nativeElement as HTMLElement;
            const cta = compiled.querySelector('.disclaimer-cta-btn') as HTMLButtonElement;
            cta.click();
            fixture.detectChanges();

            expect(playSpy).toHaveBeenCalledWith(mockCarre);
            expect(component.isOverlayVisible()).toBe(false);
            const overlay = compiled.querySelector('.audio-disclaimer-overlay');
            expect(overlay?.classList.contains('is-hidden')).toBe(true);
        });

        it('should hide the overlay automatically when audio is playing', () => {
            audioService.currentCarre.set(mockCarre);
            audioService.isPlaying.set(true);
            fixture.detectChanges();

            expect(component.isOverlayVisible()).toBe(false);
            const compiled = fixture.nativeElement as HTMLElement;
            const overlay = compiled.querySelector('.audio-disclaimer-overlay');
            expect(overlay?.classList.contains('is-hidden')).toBe(true);
        });

        it('should keep overlay hidden when paused if audio has started', () => {
            audioService.currentCarre.set(mockCarre);
            audioService.isPlaying.set(false);
            audioService.currentTime.set(45);
            fixture.detectChanges();

            expect(component.isOverlayVisible()).toBe(false);
        });

        it('should restore overlay when stop is clicked and audio resets to 0', () => {
            audioService.currentCarre.set(mockCarre);
            audioService.isPlaying.set(true);
            audioService.currentTime.set(45);
            fixture.detectChanges();
            expect(component.isOverlayVisible()).toBe(false);

            component.onStop();
            fixture.detectChanges();

            expect(component.isOverlayVisible()).toBe(true);
            const compiled = fixture.nativeElement as HTMLElement;
            const overlay = compiled.querySelector('.audio-disclaimer-overlay');
            expect(overlay?.classList.contains('is-hidden')).toBe(false);
        });

        it('should reset overlay visibility when carre input changes to another unplayed carre', () => {
            // Simulate playback started on first carre
            component.startPlaybackAndDismiss();
            fixture.detectChanges();
            expect(component.isOverlayVisible()).toBe(false);

            // Switch to another carre
            const newCarre: Carre = {
                ...mockCarre,
                id: 'carre-autre-nouveau',
                slug: 'carre-autre-slug'
            };
            fixture.componentRef.setInput('carre', newCarre);
            fixture.detectChanges();

            expect(component.isOverlayVisible()).toBe(true);
        });
    });
});

