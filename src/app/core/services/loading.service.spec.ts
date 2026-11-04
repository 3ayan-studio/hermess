import { TestBed } from '@angular/core/testing';
import { LoadingService, MIN_LOADER_DURATION_MS, LOADER_FADE_DURATION_MS } from './loading.service';
import { NavigationEnd, NavigationStart, Router, provideRouter } from '@angular/router';
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

  it('should be created and not loading initially', () => {
    expect(service).toBeTruthy();
    expect(service.isLoading()).toBe(false);
    expect(service.isFadingOut()).toBe(false);
  });

  it('should start loading when startLoader() is called', () => {
    service.startLoader();
    expect(service.isLoading()).toBe(true);
    expect(service.isFadingOut()).toBe(false);
  });

  it('should hold the loader for at least 650ms even if navigation finishes quickly', () => {
    service.startLoader();
    expect(service.isLoading()).toBe(true);

    // Navigation finishes after only 50ms
    vi.advanceTimersByTime(50);
    // Simulate NavigationEnd
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-laures', '/carre/carre-laures'));

    // At 500ms elapsed (50ms + 450ms), loader is still active and not fading out
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
    service.startLoader();
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
    // 1. Initial navigation to home (id = 1)
    (router.events as any).next(new NavigationEnd(1, '/', '/'));
    expect(service.isLoading()).toBe(false);

    // 2. Navigation from home to /carre/carre-1954-1962 (id = 2)
    (router.events as any).next(new NavigationStart(2, '/carre/carre-1954-1962'));
    expect(service.isLoading()).toBe(true);

    // 3. Navigation completes at 200ms
    vi.advanceTimersByTime(200);
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-1954-1962', '/carre/carre-1954-1962'));

    // Ensure it remains visible until 650ms (200ms + 449ms = 649ms)
    vi.advanceTimersByTime(449);
    expect(service.isFadingOut()).toBe(false);

    vi.advanceTimersByTime(1);
    expect(service.isFadingOut()).toBe(true);

    vi.advanceTimersByTime(LOADER_FADE_DURATION_MS);
    expect(service.isLoading()).toBe(false);
  });

  it('should not trigger loader when navigating from a carre back to home', () => {
    // Current route is /carre/carre-laures
    (router.events as any).next(new NavigationEnd(2, '/carre/carre-laures', '/carre/carre-laures'));
    expect(service.isLoading()).toBe(false);

    // Navigating back to home
    (router.events as any).next(new NavigationStart(3, '/'));
    expect(service.isLoading()).toBe(false);
  });
});
