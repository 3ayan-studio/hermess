import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { ZoneAGalleryPanelComponent } from './gallery-panel.component';
import { CARRES_MOCK } from '../../../../core/data/carres.mock';

describe('ZoneAGalleryPanelComponent', () => {
  let component: ZoneAGalleryPanelComponent;
  let fixture: ComponentFixture<ZoneAGalleryPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneAGalleryPanelComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ZoneAGalleryPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('carre', CARRES_MOCK[0]);
    fixture.componentRef.setInput('allCarres', CARRES_MOCK);
    fixture.detectChanges();
  });

  it('should create and render all slides horizontally', () => {
    expect(component).toBeTruthy();
    const expectedCount = CARRES_MOCK[0].media.length;
    expect(component.mediaItems().length).toBe(expectedCount);

    const compiled = fixture.nativeElement as HTMLElement;
    const slides = compiled.querySelectorAll('.swiper-slide');
    expect(slides.length).toBe(expectedCount);

    // Espace de fin desktop
    const spacer = compiled.querySelector('.slides-end-spacer');
    expect(spacer).toBeTruthy();
  });

  it('should render the compact selector panel with variants grid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectorPanel = compiled.querySelector('.selector-panel');
    expect(selectorPanel).toBeTruthy();

    const title = compiled.querySelector('.product-title');
    expect(title?.textContent?.trim()).toBe(CARRES_MOCK[0].title);
    expect(title?.textContent?.trim()).toBe("L'Aurès");

    const refText = compiled.querySelector('.product-ref');
    expect(refText).toBeNull();

    const variantButtons = compiled.querySelectorAll('.box-image');
    expect(variantButtons.length).toBe(CARRES_MOCK.length);

    const selectedVariant = compiled.querySelector('.box-image.selected');
    expect(selectedVariant).toBeTruthy();

    const priceContainer = compiled.querySelector('.product-price-container');
    expect(priceContainer).toBeNull();
    const priceText = compiled.querySelector('.product-price');
    expect(priceText).toBeNull();
  });

  it('should handle fullscreen zoom open, navigation, and close', () => {
    expect(component.isZoomOpen()).toBe(false);

    // Open zoom on slide 1
    component.openZoom(1);
    fixture.detectChanges();

    expect(component.isZoomOpen()).toBe(true);
    expect(component.zoomIndex()).toBe(1);

    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('.fullscreen-modal');
    expect(modal).toBeTruthy();

    // Next zoom
    component.nextZoom();
    expect(component.zoomIndex()).toBe(2);

    // Prev zoom
    component.prevZoom();
    expect(component.zoomIndex()).toBe(1);

    // Close zoom
    component.closeZoom();
    fixture.detectChanges();
    expect(component.isZoomOpen()).toBe(false);
  });

  it('should scroll slides with scrollSlide and update active index', () => {
    expect(component.activeSlideIndex()).toBe(0);

    component.scrollToSlide(2);
    expect(component.activeSlideIndex()).toBe(2);
  });

  it('should render the listen button for carres with interview', () => {
    // CARRES_MOCK[0] (carre-laures) has hasInterview: true
    const compiled = fixture.nativeElement as HTMLElement;
    const actionBtn = compiled.querySelector('.button-color-primary');
    expect(actionBtn).toBeTruthy();
    expect(actionBtn?.textContent).toContain('Écouter l’échange');
    const contemplation = compiled.querySelector('.contemplation-banner');
    expect(contemplation).toBeNull();
  });

  it('should scroll to the audio player section when the listen button is clicked', () => {
    const scrollSpy = vi.spyOn(component, 'scrollToAudioPlayer');
    const compiled = fixture.nativeElement as HTMLElement;
    const actionBtn = compiled.querySelector('.button-color-primary') as HTMLButtonElement;
    actionBtn.click();
    expect(scrollSpy).toHaveBeenCalled();
  });

  it('should render only duration in interview meta without voice mention', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const meta = compiled.querySelector('.interview-meta');
    expect(meta).toBeTruthy();
    expect(meta?.textContent?.trim()).toBe(`Durée : ${CARRES_MOCK[0].interview!.durationFormatted}`);
    expect(meta?.textContent).not.toContain('Voix');
  });

  it('should render the contemplation banner for carres without interview', () => {
    // carre-retour-a-la-terre has hasInterview: false
    const carreWithoutInterview = CARRES_MOCK.find(c => !c.hasInterview)!;
    fixture.componentRef.setInput('carre', carreWithoutInterview);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const contemplation = compiled.querySelector('.contemplation-banner');
    expect(contemplation).toBeTruthy();

    const actionBtn = compiled.querySelector('.button-color-primary');
    expect(actionBtn).toBeNull();
  });

  it('should render carousel-panel, carousel-container, and dots pagination for mobile ISO Hermès layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const panel = compiled.querySelector('.carousel-panel');
    expect(panel).toBeTruthy();

    const container = compiled.querySelector('.carousel-container');
    expect(container).toBeTruthy();

    const dots = compiled.querySelector('.mobile-dots-pagination');
    expect(dots).toBeTruthy();
    const dotElements = dots?.querySelectorAll('.dot');
    const expectedCount = CARRES_MOCK[0].media.length;
    expect(dotElements?.length).toBe(expectedCount);
  });

  it('should render video slides with autoplay, loop, muted and Hermès play/pause button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const video = compiled.querySelector('video.media-video') as HTMLVideoElement;
    expect(video).toBeTruthy();
    expect(video.hasAttribute('autoplay')).toBe(true);
    expect(video.hasAttribute('loop')).toBe(true);
    expect(video.muted).toBe(true);

    const pauseBtn = compiled.querySelector('.video-play-pause-btn') as HTMLButtonElement;
    expect(pauseBtn).toBeTruthy();
    expect(pauseBtn.getAttribute('title')).toBe('Pause');

    // Simulate clicking pause button
    pauseBtn.click();
    fixture.detectChanges();
    expect(pauseBtn.getAttribute('title')).toBe('Lecture');
  });

  it('should apply cover-mode to narrow vertical images like carre-laures detail-02 to prevent horizontal gaps', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const coverImages = compiled.querySelectorAll('.slide-image-btn img.cover-mode');
    expect(coverImages.length).toBe(1);
    const coverImg = coverImages[0] as HTMLImageElement;
    expect(coverImg.getAttribute('src')).toContain('carre-laures/detail-02');
  });
});

