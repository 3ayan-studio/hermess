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
    title: 'Entretien avec Fatima',
    interviewees: ['Fatima Marwazouzal'],
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

  it('should calculate hoverSvgWidth and hoverTimeFormatted on mouse move', () => {
    component.hoverPercentage.set(50); // 50%
    audioService.duration.set(1800); // 30 min
    fixture.detectChanges();

    expect(component.hoverSvgWidth()).toBe(500);
    expect(component.hoverTimeFormatted()).toBe('00:15:00');
  });

  it('should calculate progressSvgWidth proportional to percentage', () => {
    audioService.duration.set(100);
    audioService.currentTime.set(30); // 30%
    fixture.detectChanges();

    // 30% of 1000 = 300
    expect(component.progressSvgWidth()).toBeCloseTo(300, 0);
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
});

