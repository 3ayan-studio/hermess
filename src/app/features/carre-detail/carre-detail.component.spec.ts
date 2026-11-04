import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CarreDetailComponent } from './carre-detail.component';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { CARRES_MOCK } from '../../core/data/carres.mock';

describe('CarreDetailComponent', () => {
  let component: CarreDetailComponent;
  let fixture: ComponentFixture<CarreDetailComponent>;
  let audioService: AudioPlayerService;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [CarreDetailComponent],
      providers: [provideRouter([]), AudioPlayerService]
    }).compileComponents();

    audioService = TestBed.inject(AudioPlayerService);
    fixture = TestBed.createComponent(CarreDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and resolve carre from slug input', () => {
    fixture.componentRef.setInput('slug', 'carre-laures');
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.carre()?.slug).toBe('carre-laures');
  });

  it('should trigger playFromTime when t input is provided', () => {
    const playFromTimeSpy = vi.spyOn(audioService, 'playFromTime');

    fixture.componentRef.setInput('slug', 'carre-laures');
    fixture.componentRef.setInput('t', '16');
    fixture.detectChanges();

    expect(playFromTimeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'carre-laures' }),
      16
    );
  });

  it('should display audio sticky bar and transcript when carre has interview', () => {
    fixture.componentRef.setInput('slug', 'carre-laures');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#audio-sticky-section')).not.toBeNull();
    expect(element.querySelector('app-audio-sticky-bar')).not.toBeNull();
    expect(element.querySelector('app-transcript')).not.toBeNull();
    expect(element.querySelector('app-home-quote-carousel')).toBeNull();
  });

  it('should display quotes module instead of audio when carre has NO interview', () => {
    fixture.componentRef.setInput('slug', 'carre-retour-a-la-terre');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#audio-sticky-section')).toBeNull();
    expect(element.querySelector('app-audio-sticky-bar')).toBeNull();
    expect(element.querySelector('app-transcript')).toBeNull();
    expect(element.querySelector('app-home-quote-carousel')).not.toBeNull();
  });
});

