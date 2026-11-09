import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TranscriptComponent, stripHtmlTags } from './transcript.component';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';
import { TranscriptService } from '../../../../core/services/transcript.service';
import { Carre } from '../../../../core/models/carre.model';
import { SegmentedTranscript } from '../../../../core/models/transcript.model';

const mockSegmentedData: SegmentedTranscript = {
    metadata: {
        title: 'Échange avec Fatima',
        speakers: {
            S1: { name: 'Fatima-Marwa Zouzal', role: 'Artiste' },
            S2: { name: 'Habib Hadjar', role: 'Interviewer' }
        }
    },
    segments: [
        { id: 'seg-0', speaker: 'S2', start: 0.0, end: 5.0, text: 'Bonjour Fatima.' },
        { id: 'seg-1', speaker: 'S1', start: 5.0, end: 20.0, text: 'Bonjour Habib, bienvenue.' },
        { id: 'seg-2', speaker: 'S1', start: 20.0, end: 60.0, text: 'Le carré parachute dans les <em>Aurès</em> au-dessus de <i>Kbach</i>.' },
        { id: 'seg-3', speaker: 'S2', start: 60.0, end: 80.0, text: 'Parlez-nous de ce saut.' }
    ]
};

const mockCarreWithTranscript: Carre = {
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
    media: [{ id: 'm1', type: 'image', url: 'image.jpg', alt: "L'Aurès" }],
    carouselMedia: { id: 'c1', type: 'image', url: 'image.jpg', alt: "L'Aurès" },
    thumbnail: 'thumb.jpg',
    hasInterview: true,
    interview: {
        audioUrl: 'https://example.com/audio.mp3',
        transcriptUrl: '/carres/carre-laures/segmented-transcript.json',
        durationSeconds: 1800,
        durationFormatted: '00:30:00',
        title: 'Échange avec Fatima',
        interviewees: ['Fatima-Marwa Zouzal', 'Habib Hadjar'],
        synopsis: 'Synopsis test'
    }
};

describe('TranscriptComponent', () => {
    let component: TranscriptComponent;
    let fixture: ComponentFixture<TranscriptComponent>;
    let audioService: AudioPlayerService;
    let transcriptService: TranscriptService;

    beforeEach(async () => {
        // Mock polyfill pour JSDOM
        if (typeof Element !== 'undefined') {
            Element.prototype.scrollTo = vi.fn();
            Element.prototype.scrollIntoView = vi.fn();
        }

        await TestBed.configureTestingModule({
            imports: [TranscriptComponent],
            providers: [AudioPlayerService, TranscriptService]
        }).compileComponents();

        transcriptService = TestBed.inject(TranscriptService);
        vi.spyOn(transcriptService, 'loadTranscript').mockResolvedValue(mockSegmentedData);

        fixture = TestBed.createComponent(TranscriptComponent);
        component = fixture.componentInstance;
        audioService = TestBed.inject(AudioPlayerService);

        fixture.componentRef.setInput('carre', mockCarreWithTranscript);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render the muted subtitle with redacted bar and no large title', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.transcript-main-title')).toBeNull();
        expect(compiled.querySelector('.transcript-speakers-sub')).toBeNull();

        const subtitle = compiled.querySelector('.transcript-subtitle-muted');
        expect(subtitle).not.toBeNull();
        expect(subtitle?.textContent).toContain("Transcription de l'échange entre");
        expect(subtitle?.textContent).toContain('et Fatima-Marwa');

        const redactedBar = subtitle?.querySelector('.redacted-bar');
        expect(redactedBar).not.toBeNull();
        expect(redactedBar?.getAttribute('aria-label')).toBe('Identité caviardée');
    });

    it('should not render a static disclaimer in the header', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.transcript-content-warning')).toBeNull();
    });

    describe('Transcript Disclaimer Overlay', () => {
        it('should show the disclaimer overlay by default over the transcript wrapper', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const overlay = compiled.querySelector('.transcript-disclaimer-overlay');
            expect(overlay).toBeTruthy();
            expect(overlay?.classList.contains('is-hidden')).toBe(false);

            expect(overlay?.textContent).toContain('Contenu sensible');
            expect(overlay?.textContent).toContain('Cet enregistrement et sa transcription comportent des récits éprouvants.');

            const warningIcon = overlay?.querySelector('svg.warning-icon');
            expect(warningIcon).toBeTruthy();

            const unlockBtn = overlay?.querySelector('.unlock-btn');
            expect(unlockBtn).toBeTruthy();
            expect(unlockBtn?.textContent).toContain('Lire la transcription');

            const playBtn = overlay?.querySelector('.play-btn');
            expect(playBtn).toBeTruthy();
            expect(playBtn?.textContent).toContain('Écouter');
        });

        it('should unlock the transcript when unlock button is clicked', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const unlockBtn = compiled.querySelector('.unlock-btn') as HTMLButtonElement;
            unlockBtn.click();
            fixture.detectChanges();

            expect(component.isOverlayVisible()).toBe(false);
            const overlay = compiled.querySelector('.transcript-disclaimer-overlay');
            expect(overlay?.classList.contains('is-hidden')).toBe(true);
            expect(audioService.dismissedDisclaimerCarres().has(mockCarreWithTranscript.id)).toBe(true);
        });

        it('should unlock and start playback when play button is clicked', () => {
            const playSpy = vi.spyOn(audioService, 'playCarre');
            const compiled = fixture.nativeElement as HTMLElement;
            const playBtn = compiled.querySelector('.disclaimer-actions .play-btn') as HTMLButtonElement;
            playBtn.click();
            fixture.detectChanges();

            expect(playSpy).toHaveBeenCalledWith(mockCarreWithTranscript);
            expect(component.isOverlayVisible()).toBe(false);
        });

        it('should hide the overlay automatically when audio is playing', () => {
            audioService.currentCarre.set(mockCarreWithTranscript);
            audioService.isPlaying.set(true);
            fixture.detectChanges();

            expect(component.isOverlayVisible()).toBe(false);
            const compiled = fixture.nativeElement as HTMLElement;
            const overlay = compiled.querySelector('.transcript-disclaimer-overlay');
            expect(overlay?.classList.contains('is-hidden')).toBe(true);
        });
    });

    it('should be collapsed by default', () => {
        expect(component.isExpanded()).toBe(false);
    });

    it('should toggle expansion state when toggleExpanded is called', () => {
        component.toggleExpanded();
        expect(component.isExpanded()).toBe(true);

        component.toggleExpanded();
        expect(component.isExpanded()).toBe(false);
    });

    it('should render segments and speaker names accurately', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const turns = compiled.querySelectorAll('.transcript-turn');
        expect(turns.length).toBe(4);

        const firstSpeaker = turns[0].querySelector('.speaker-name');
        expect(firstSpeaker?.textContent?.trim()).toBe('Habib Hadjar');

        const secondSpeaker = turns[1].querySelector('.speaker-name');
        expect(secondSpeaker?.textContent?.trim()).toBe('Fatima-Marwa Zouzal');
    });

    it('should render HTML formatting tags (em, i) in turn-text and strip them in aria-label', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const thirdTurn = compiled.querySelector('[data-segment-id="seg-2"]');
        expect(thirdTurn).not.toBeNull();

        const turnText = thirdTurn?.querySelector('.turn-text');
        expect(turnText).not.toBeNull();

        const emElement = turnText?.querySelector('em');
        expect(emElement).not.toBeNull();
        expect(emElement?.textContent).toBe('Aurès');

        const iElement = turnText?.querySelector('i');
        expect(iElement).not.toBeNull();
        expect(iElement?.textContent).toBe('Kbach');

        const ariaLabel = thirdTurn?.getAttribute('aria-label');
        expect(ariaLabel).toContain('dans les Aurès au-dessus de Kbach.');
        expect(ariaLabel).not.toContain('<em>');
        expect(ariaLabel).not.toContain('<i>');
        expect(ariaLabel).not.toContain('</em>');
        expect(ariaLabel).not.toContain('</i>');

        // Test direct de la fonction utilitaire stripHtmlTags
        expect(stripHtmlTags('Texte <em>avec</em> balises <b>HTML</b>')).toBe('Texte avec balises HTML');
        expect(stripHtmlTags('')).toBe('');
    });

    it('should compute activeSegmentIndex and activeSegmentId based on audio currentTime', () => {
        audioService.currentCarre.set(mockCarreWithTranscript);

        audioService.currentTime.set(2.0);
        expect(component.activeSegmentIndex()).toBe(0);
        expect(component.activeSegmentId()).toBe('seg-0');

        audioService.currentTime.set(10.0);
        expect(component.activeSegmentIndex()).toBe(1);
        expect(component.activeSegmentId()).toBe('seg-1');

        audioService.currentTime.set(70.0);
        expect(component.activeSegmentIndex()).toBe(3);
        expect(component.activeSegmentId()).toBe('seg-3');
    });

    it('should seek audio when a segment is clicked', () => {
        const seekSpy = vi.spyOn(audioService, 'seekTo');
        const seg = mockSegmentedData.segments[2]; // start 20.0s

        component.onSegmentClick(seg);

        expect(seekSpy).toHaveBeenCalledWith(20.0);
        expect(audioService.currentCarre()?.id).toBe(mockCarreWithTranscript.id);
    });

    it('should pause auto-scroll and show floating button on manual scroll during playback', () => {
        audioService.currentCarre.set(mockCarreWithTranscript);
        audioService.isPlaying.set(true);
        fixture.detectChanges();

        expect(component.isUserScrolling()).toBe(false);

        component.onManualScroll();
        fixture.detectChanges();

        expect(component.isUserScrolling()).toBe(true);
        const compiled = fixture.nativeElement as HTMLElement;
        const resumeBtn = compiled.querySelector('.resume-follow-btn');
        expect(resumeBtn).toBeTruthy();

        // Cliquer sur le bouton flottant reprend le suivi
        component.resumeAutoScroll();
        fixture.detectChanges();

        expect(component.isUserScrolling()).toBe(false);
    });

    it('should apply active classes to the currently playing segment', () => {
        audioService.currentCarre.set(mockCarreWithTranscript);
        audioService.isPlaying.set(true);
        audioService.currentTime.set(12.0); // segment 1
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const activeTurn = compiled.querySelector('[data-segment-id="seg-1"]');
        const inactiveTurn = compiled.querySelector('[data-segment-id="seg-0"]');

        expect(activeTurn?.classList.contains('is-active')).toBe(true);
        expect(inactiveTurn?.classList.contains('is-inactive')).toBe(true);
    });
});
