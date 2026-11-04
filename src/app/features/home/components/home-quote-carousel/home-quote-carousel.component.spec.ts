import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeQuoteCarouselComponent } from './home-quote-carousel.component';
import { AudioQuote } from '../../../../core/models/quote.model';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';

const TEST_QUOTES: AudioQuote[] = [
  {
    id: 'test-q1',
    carreSlug: 'carre-laures',
    carreTitle: "L'Aurès",
    segmentId: 'seg-3',
    timestampSeconds: 16,
    timestampFormatted: '00:00:16',
    quote: 'La France nous chasse de nos <em>montagnes</em>.',
    speaker: 'Témoin 1',
    speakerRole: 'Mémoire'
  },
  {
    id: 'test-q2',
    carreSlug: 'carre-1954-1962',
    carreTitle: '1954-1962',
    segmentId: 'seg-4',
    timestampSeconds: 22,
    timestampFormatted: '00:00:22',
    quote: 'En 1955, je commençais à comprendre.',
    speaker: 'Témoin 2',
    speakerRole: 'Récit'
  }
];

describe('HomeQuoteCarouselComponent', () => {
  let component: HomeQuoteCarouselComponent;
  let fixture: ComponentFixture<HomeQuoteCarouselComponent>;
  let router: Router;
  let audioPlayerService: AudioPlayerService;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [HomeQuoteCarouselComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    router = TestBed.inject(Router);
    audioPlayerService = TestBed.inject(AudioPlayerService);
    fixture = TestBed.createComponent(HomeQuoteCarouselComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('quotes', TEST_QUOTES);
    fixture.detectChanges();
  });

  afterEach(() => {
    component.stopAutoPlay();
    vi.useRealTimers();
  });

  it('should initialize with first quote active and track positioned at index 1 (after clone-last)', () => {
    expect(component).toBeTruthy();
    expect(component.activeIndex()).toBe(0);
    expect(component.trackIndex()).toBe(1);
    expect(component.displaySlides().length).toBe(4); // [clone-last, real-0, real-1, clone-first]

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('La France nous chasse de nos montagnes.');
    expect(element.textContent).toContain("L'Aurès");
  });

  it('should render HTML markup like em within quotes without escaping', () => {
    const activeSlide = fixture.nativeElement.querySelector('.quote-slide.is-active');
    const quoteContent = activeSlide?.querySelector('.quote-content');
    expect(quoteContent).not.toBeNull();

    const em = quoteContent?.querySelector('em');
    expect(em).not.toBeNull();
    expect(em?.textContent).toBe('montagnes');
    expect(quoteContent?.innerHTML).toContain('<em>montagnes</em>');
  });

  it('should auto-cycle quotes every 7000ms', () => {
    expect(component.activeIndex()).toBe(0);

    vi.advanceTimersByTime(7000);
    expect(component.activeIndex()).toBe(1);

    vi.advanceTimersByTime(7000);
    expect(component.activeIndex()).toBe(0);
  });

  it('should pause auto-cycling when paused and resume when unpaused', () => {
    expect(component.activeIndex()).toBe(0);

    component.pauseAutoPlay();
    expect(component.isPaused()).toBe(true);

    vi.advanceTimersByTime(14000);
    expect(component.activeIndex()).toBe(0); // Resté à 0 car en pause

    component.resumeAutoPlay();
    expect(component.isPaused()).toBe(false);

    vi.advanceTimersByTime(7000);
    expect(component.activeIndex()).toBe(1);
  });

  it('should navigate to specific quote when bullet is clicked', () => {
    component.goToQuote(1);
    fixture.detectChanges();
    expect(component.activeIndex()).toBe(1);
    expect(component.trackIndex()).toBe(2);

    vi.advanceTimersByTime(500); // Fin animation

    component.goToQuote(0);
    fixture.detectChanges();
    expect(component.activeIndex()).toBe(0);
    expect(component.trackIndex()).toBe(1);
  });

  it('should update trackIndex and trackTransform when advancing with infinite loop', () => {
    expect(component.trackIndex()).toBe(1);
    expect(component.activeIndex()).toBe(0);
    expect(component.trackTransform()).toBe('translate3d(-100%, 0, 0)');

    component.nextQuote();
    expect(component.trackIndex()).toBe(2);
    expect(component.activeIndex()).toBe(1);
    expect(component.trackTransform()).toBe('translate3d(-200%, 0, 0)');

    vi.advanceTimersByTime(500); // Laisse l'animation se terminer

    // Avance vers le clone de fin (slide 3)
    component.nextQuote();
    expect(component.trackIndex()).toBe(3);
    expect(component.activeIndex()).toBe(0);
    expect(component.trackTransform()).toBe('translate3d(-300%, 0, 0)');

    // Repositionnement transparent sur la vraie slide 1
    vi.advanceTimersByTime(480);
    expect(component.trackIndex()).toBe(1);
    expect(component.withTransition()).toBe(true);
  });

  it('should loop backwards transparently from slide 1 to slide 0 (clone-last) then snap to real last slide', () => {
    expect(component.trackIndex()).toBe(1);
    expect(component.activeIndex()).toBe(0);

    component.prevQuote();
    expect(component.trackIndex()).toBe(0); // Clone-last
    expect(component.activeIndex()).toBe(1); // Dernier élément
    expect(component.trackTransform()).toBe('translate3d(-0%, 0, 0)');

    // Repositionnement transparent sur le vrai dernier slot (2)
    vi.advanceTimersByTime(480);
    expect(component.trackIndex()).toBe(2);
    expect(component.withTransition()).toBe(true);
  });

  it('should navigate to carre page with queryParams on listen click', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const quote = TEST_QUOTES[0];

    component.onListenQuote(quote);

    expect(navigateSpy).toHaveBeenCalledWith(['/carre', 'carre-laures'], {
      queryParams: {
        t: 16,
        seg: 'seg-3'
      }
    });
  });

  it('should navigate and trigger audio when the listen button DOM element is clicked in active slide', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const audioSpy = vi.spyOn(audioPlayerService, 'playFromTime');

    const activeSlide = fixture.nativeElement.querySelector('.quote-slide.is-active');
    const button = activeSlide?.querySelector('.listen-button') as HTMLButtonElement;
    expect(button).not.toBeNull();

    button.click();

    expect(audioSpy).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'carre-laures' }),
      16
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/carre', 'carre-laures'], {
      queryParams: {
        t: 16,
        seg: 'seg-3'
      }
    });
  });

  it('should ignore pointerdown and not initiate drag when pointerdown originates from a button or link', () => {
    const button = document.createElement('button');
    const event = new PointerEvent('pointerdown', {
      clientX: 200,
      clientY: 100,
      button: 0,
      pointerId: 1
    });
    Object.defineProperty(event, 'target', { value: button });

    component.onPointerDown(event);

    expect(component.isDragging()).toBe(false);
    expect(component.dragOffset()).toBe(0);
  });

  describe('Continuous physical swipe gestures (1:1 tracking)', () => {
    it('should reflect 1:1 direct tracking in trackTransform during drag', () => {
      component.onPointerDown(new PointerEvent('pointerdown', { clientX: 200, clientY: 100, button: 0, pointerId: 1 }));
      component.onPointerMove(new PointerEvent('pointermove', { clientX: 150, clientY: 100, pointerId: 1 })); // deltaX = -50

      expect(component.isDragging()).toBe(true);
      expect(component.dragOffset()).toBe(-50);
      expect(component.withTransition()).toBe(false);
      expect(component.trackTransform()).toBe('translate3d(calc(-100% + -50px), 0, 0)');

      component.onPointerUp(new PointerEvent('pointerup', { clientX: 150, clientY: 100, pointerId: 1 }));
    });

    it('should navigate to next quote on left swipe (deltaX < -40)', () => {
      expect(component.activeIndex()).toBe(0);

      component.onPointerDown(new PointerEvent('pointerdown', { clientX: 200, clientY: 100, button: 0, pointerId: 1 }));
      component.onPointerMove(new PointerEvent('pointermove', { clientX: 140, clientY: 100, pointerId: 1 })); // deltaX = -60
      component.onPointerUp(new PointerEvent('pointerup', { clientX: 140, clientY: 100, pointerId: 1 }));

      expect(component.activeIndex()).toBe(1);
      expect(component.trackIndex()).toBe(2);
    });

    it('should navigate to previous quote on right swipe (deltaX > 40)', () => {
      component.goToQuote(1);
      vi.advanceTimersByTime(500);
      expect(component.activeIndex()).toBe(1);
      expect(component.trackIndex()).toBe(2);

      component.onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, button: 0, pointerId: 1 }));
      component.onPointerMove(new PointerEvent('pointermove', { clientX: 160, clientY: 100, pointerId: 1 })); // deltaX = +60
      component.onPointerUp(new PointerEvent('pointerup', { clientX: 160, clientY: 100, pointerId: 1 }));

      expect(component.activeIndex()).toBe(0);
      expect(component.trackIndex()).toBe(1);
    });

    it('should snap back to current slide if swipe distance is below threshold', () => {
      expect(component.activeIndex()).toBe(0);
      expect(component.trackIndex()).toBe(1);

      component.onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, button: 0, pointerId: 1 }));
      component.onPointerMove(new PointerEvent('pointermove', { clientX: 85, clientY: 100, pointerId: 1 })); // deltaX = -15
      component.onPointerUp(new PointerEvent('pointerup', { clientX: 85, clientY: 100, pointerId: 1 }));

      expect(component.activeIndex()).toBe(0);
      expect(component.trackIndex()).toBe(1);
      expect(component.dragOffset()).toBe(0);
      expect(component.withTransition()).toBe(true);
    });

    it('should navigate on fast flick even if distance is between 20 and 40 px', () => {
      expect(component.activeIndex()).toBe(0);

      component.onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, button: 0, pointerId: 1 }));
      component.onPointerMove(new PointerEvent('pointermove', { clientX: 75, clientY: 100, pointerId: 1 })); // deltaX = -25
      component.onPointerUp(new PointerEvent('pointerup', { clientX: 75, clientY: 100, pointerId: 1 }));

      expect(component.activeIndex()).toBe(1);
    });

    it('should ignore horizontal swipe if vertical scroll gesture dominates', () => {
      expect(component.activeIndex()).toBe(0);

      component.onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, button: 0, pointerId: 1 }));
      component.onPointerMove(new PointerEvent('pointermove', { clientX: 90, clientY: 140, pointerId: 1 })); // deltaY = 40, deltaX = -10
      component.onPointerUp(new PointerEvent('pointerup', { clientX: 90, clientY: 140, pointerId: 1 }));

      expect(component.activeIndex()).toBe(0);
    });

    it('should inhibit onListenQuote when a drag gesture has just occurred', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const quote = TEST_QUOTES[0];

      component.onPointerDown(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, button: 0, pointerId: 1 }));
      component.onPointerMove(new PointerEvent('pointermove', { clientX: 40, clientY: 100, pointerId: 1 }));
      component.onPointerUp(new PointerEvent('pointerup', { clientX: 40, clientY: 100, pointerId: 1 }));

      // Clic immédiat
      component.onListenQuote(quote);
      expect(navigateSpy).not.toHaveBeenCalled();

      // Après expiration du délai anti-rebond
      vi.advanceTimersByTime(150);
      component.onListenQuote(quote);
      expect(navigateSpy).toHaveBeenCalledTimes(1);
    });

    it('should navigate via keyboard arrow keys', () => {
      expect(component.activeIndex()).toBe(0);

      const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      vi.spyOn(eventRight, 'preventDefault');
      component.onKeyArrowRight(eventRight);
      expect(component.activeIndex()).toBe(1);

      vi.advanceTimersByTime(500);

      const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      vi.spyOn(eventLeft, 'preventDefault');
      component.onKeyArrowLeft(eventLeft);
      expect(component.activeIndex()).toBe(0);
    });
  });
});
