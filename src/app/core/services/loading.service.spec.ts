import { TestBed } from '@angular/core/testing';
import { LoadingService, MIN_LOADER_DURATION_MS, INITIAL_LOADER_DURATION_MS, LOADER_FADE_DURATION_MS } from './loading.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('LoadingService', () => {
  let service: LoadingService;
  let router: Router;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        provideRouter([])
      ]
    });
    service = TestBed.inject(LoadingService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be loading initially on app boot and hold for at least 1500ms', () => {
    expect(service).toBeTruthy();
    expect(service.isLoading()).toBe(true);
    expect(service.isFadingOut()).toBe(false);

    // Initial navigation ends at 50ms
    vi.advanceTimersByTime(50);
    (router.events as any).next(new NavigationEnd(1, '/', '/'));

    // Loader should still be active at 1000ms
    vi.advanceTimersByTime(950); // 1000ms total
    expect(service.isLoading()).toBe(true);
    expect(service.isFadingOut()).toBe(false);

    // Loader still active right before 1500ms
    vi.advanceTimersByTime(499); // 1499ms total
    expect(service.isLoading()).toBe(true);
    expect(service.isFadingOut()).toBe(false);

    // At 1500ms, fade-out starts
    vi.advanceTimersByTime(1); // 1500ms total
    expect(service.isFadingOut()).toBe(true);

    // At 1850ms (+350ms fade transition), loader is completely hidden
    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);
    expect(service.isFadingOut()).toBe(false);
  });

  it('should hold the loader for at least 650ms during subsequent page navigation', () => {
    // Finish initial boot
    service.stopLoader();
    expect(service.isLoading()).toBe(false);

    // Navigate to carre (id = 2)
    (router.events as any).next(new NavigationStart(2, '/carre/carre-laures'));
    expect(service.isLoading()).toBe(true);

    // Navigation finishes quickly after 50ms
    vi.advanceTimersByTime(50);
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-laures', '/carre/carre-laures'));

    // At 500ms elapsed, loader is still active and not fading out
    vi.advanceTimersByTime(450); // 500ms total
    expect(service.isLoading()).toBe(true);
    expect(service.isFadingOut()).toBe(false);

    // At 649ms elapsed, still not fading out
    vi.advanceTimersByTime(149); // 649ms total
    expect(service.isLoading()).toBe(true);
    expect(service.isFadingOut()).toBe(false);

    // At 650ms elapsed, fade-out begins
    vi.advanceTimersByTime(1); // 650ms total
    expect(service.isFadingOut()).toBe(true);

    // At 1000ms elapsed (+350ms fade transition), loader is completely hidden
    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);
    expect(service.isFadingOut()).toBe(false);
  });

  it('should fade out immediately if navigation takes longer than 650ms', () => {
    service.stopLoader();
    expect(service.isLoading()).toBe(false);

    (router.events as any).next(new NavigationStart(2, '/carre/carre-laures'));
    expect(service.isLoading()).toBe(true);

    // Navigation finishes after 800ms (> 650ms)
    vi.advanceTimersByTime(800);
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-laures', '/carre/carre-laures'));

    // remaining = 0ms, so fade-out timer fires on next tick
    vi.advanceTimersByTime(0);
    expect(service.isFadingOut()).toBe(true);

    // Loader is completely hidden after 350ms fade transition
    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);
    expect(service.isFadingOut()).toBe(false);
  });

  it('should trigger loader when navigating from home (/) to /carre/:slug', () => {
    service.stopLoader();
    (router.events as any).next(new NavigationEnd(1, '/', '/'));
    expect(service.isLoading()).toBe(false);

    (router.events as any).next(new NavigationStart(2, '/carre/carre-1954-1962'));
    expect(service.isLoading()).toBe(true);

    vi.advanceTimersByTime(200);
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-1954-1962', '/carre/carre-1954-1962'));

    // Remains visible until 650ms (200ms + 449ms = 649ms)
    vi.advanceTimersByTime(449);
    expect(service.isFadingOut()).toBe(false);

    vi.advanceTimersByTime(1);
    expect(service.isFadingOut()).toBe(true);

    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);
  });

  it('should trigger loader when navigating from a carre back to home (/)', () => {
    service.stopLoader();
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-laures', '/carre/carre-laures'));
    expect(service.isLoading()).toBe(false);

    // Navigating back to home
    (router.events as any).next(new NavigationStart(3, '/'));
    expect(service.isLoading()).toBe(true);

    vi.advanceTimersByTime(100);
    (router.events as any).next(new NavigationEnd(3, '/', '/'));

    vi.advanceTimersByTime(MIN_LOADER_DURATION_MS - 100);
    expect(service.isFadingOut()).toBe(true);

    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);
  });

  it('should trigger loader when navigating between two different carres', () => {
    service.stopLoader();
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-laures', '/carre/carre-laures'));
    expect(service.isLoading()).toBe(false);

    (router.events as any).next(new NavigationStart(3, '/carre/carre-1954-1962'));
    expect(service.isLoading()).toBe(true);
  });

  it('should trigger loader when navigating to /a-propos and /her-story-her-mess', () => {
    service.stopLoader();
    (router.events as any).next(new NavigationEnd(2, '/', '/'));
    expect(service.isLoading()).toBe(false);

    // To /a-propos
    (router.events as any).next(new NavigationStart(3, '/a-propos'));
    expect(service.isLoading()).toBe(true);

    vi.advanceTimersByTime(100);
    (router.events as any).next(new NavigationEnd(3, '/a-propos', '/a-propos'));
    vi.advanceTimersByTime(MIN_LOADER_DURATION_MS);
    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);

    // From /a-propos to /her-story-her-mess
    (router.events as any).next(new NavigationStart(4, '/her-story-her-mess'));
    expect(service.isLoading()).toBe(true);
  });

  it('should NOT trigger loader when navigating on the same page with query parameters', () => {
    service.stopLoader();
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-laures', '/carre/carre-laures'));
    expect(service.isLoading()).toBe(false);

    // Timestamp / segment seek on the same carre
    (router.events as any).next(new NavigationStart(3, '/carre/carre-laures?t=150&seg=seg-4'));
    expect(service.isLoading()).toBe(false);
  });

  it('should NOT trigger loader when navigating on the same page with a fragment', () => {
    service.stopLoader();
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-laures', '/carre/carre-laures'));
    expect(service.isLoading()).toBe(false);

    // Anchor jump on the same carre
    (router.events as any).next(new NavigationStart(3, '/carre/carre-laures#audio-sticky-section'));
    expect(service.isLoading()).toBe(false);
  });

  it('should finish loader on NavigationCancel or NavigationError', () => {
    service.stopLoader();
    (router.events as any).next(new NavigationEnd(1, '/', '/'));

    // Test NavigationCancel
    (router.events as any).next(new NavigationStart(2, '/carre/carre-laures'));
    expect(service.isLoading()).toBe(true);

    (router.events as any).next(new NavigationCancel(2, '/carre/carre-laures', 'redirected'));
    vi.advanceTimersByTime(MIN_LOADER_DURATION_MS);
    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);

    // Test NavigationError
    (router.events as any).next(new NavigationStart(3, '/carre/carre-error'));
    expect(service.isLoading()).toBe(true);

    (router.events as any).next(new NavigationError(3, '/carre/carre-error', new Error('Navigation failed')));
    vi.advanceTimersByTime(MIN_LOADER_DURATION_MS);
    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);
  });
});
