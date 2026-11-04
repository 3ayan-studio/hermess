import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeCarouselComponent } from './home-carousel.component';
import { CARRES_MOCK } from '../../../../core/data/carres.mock';

describe('HomeCarouselComponent', () => {
  let component: HomeCarouselComponent;
  let fixture: ComponentFixture<HomeCarouselComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [HomeCarouselComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeCarouselComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('carres', CARRES_MOCK);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create and initialize 9 dynamic slots centered around Carre 0', () => {
    expect(component).toBeTruthy();
    expect(component.carres().length).toBe(CARRES_MOCK.length);
    expect(component.displaySlots().length).toBe(9);
    expect(component.activeCarreIndex()).toBe(0);
    expect(component.activeSlot()).toBe(0);

    // Slot 0 (centre) doit être le carré 0
    const centerSlot = component.displaySlots().find(s => s.slotOffset === 0);
    expect(centerSlot?.carre.id).toBe(CARRES_MOCK[0].id);

    // Slot -1 (gauche immédiate) doit être le dernier carré (Carre 5)
    const prevSlot = component.displaySlots().find(s => s.slotOffset === -1);
    expect(prevSlot?.carre.id).toBe(CARRES_MOCK[CARRES_MOCK.length - 1].id);

    // Slot +1 (droite immédiate) doit être le carré 1
    const nextSlot = component.displaySlots().find(s => s.slotOffset === 1);
    expect(nextSlot?.carre.id).toBe(CARRES_MOCK[1].id);
  });

  it('should only render pill button on slot 0 and hide it during slide transition to eliminate flash', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Il ne doit y avoir qu'un seul bouton editorial-cta dans tout le carrousel (sur le slot central 0)
    const buttons = compiled.querySelectorAll('.editorial-cta');
    expect(buttons.length).toBe(1);

    // Au repos, le bouton a la classe show
    expect(buttons[0].classList.contains('show')).toBe(true);

    // Déclenchement de la transition (+1)
    component.onSlideClick(1, CARRES_MOCK[1]);
    fixture.detectChanges();

    // Pendant l'animation, isAnimating est true -> le bouton perd .show
    expect(component.isAnimating()).toBe(true);
    expect(buttons[0].classList.contains('show')).toBe(false);

    // Fin de l'animation (500ms) + 1 frame d'animation (20ms) pour requestAnimationFrame
    vi.advanceTimersByTime(520);
    fixture.detectChanges();

    // Après l'animation, isAnimating redevient false -> le bouton réapparaît avec .show
    expect(component.isAnimating()).toBe(false);
    expect(buttons[0].classList.contains('show')).toBe(true);
    expect(buttons[0].textContent).toContain(CARRES_MOCK[1].title);
  });

  it('should slide seamlessly forward (+1) without return express', () => {
    expect(component.activeCarreIndex()).toBe(0);

    // Clic sur le slide suivant (+1)
    component.onSlideClick(1, CARRES_MOCK[1]);
    expect(component.isAnimating()).toBe(true);
    expect(component.activeSlot()).toBe(1);

    // Avancement du timer de 500ms
    vi.advanceTimersByTime(500);

    expect(component.activeCarreIndex()).toBe(1);
    expect(component.activeSlot()).toBe(0);
    expect(component.indicatorMarginLeft()).toBeCloseTo(100 / CARRES_MOCK.length, 1);
  });

  it('should slide seamlessly backward (-1) from first to last carré without return express', () => {
    expect(component.activeCarreIndex()).toBe(0);

    // Clic sur le slide précédent (-1) alors qu'on est sur le premier carré (0)
    component.onSlideClick(-1, CARRES_MOCK[CARRES_MOCK.length - 1]);
    expect(component.isAnimating()).toBe(true);
    expect(component.activeSlot()).toBe(-1);

    vi.advanceTimersByTime(500);

    // L'élément actif est maintenant le dernier carré (5)
    expect(component.activeCarreIndex()).toBe(CARRES_MOCK.length - 1);
    expect(component.activeSlot()).toBe(0);
    expect(component.indicatorMarginLeft()).toBeCloseTo((CARRES_MOCK.length - 1) * (100 / CARRES_MOCK.length), 1);
  });

  it('should slide seamlessly forward (+1) from last to first carré without return express', () => {
    // On se place sur le dernier carré (5)
    component.activeCarreIndex.set(CARRES_MOCK.length - 1);
    fixture.detectChanges();

    // Le slot +1 est le premier carré (0)
    const nextSlot = component.displaySlots().find(s => s.slotOffset === 1);
    expect(nextSlot?.carre.id).toBe(CARRES_MOCK[0].id);

    // Clic sur le slot +1 pour revenir au premier carré
    component.onSlideClick(1, CARRES_MOCK[0]);
    expect(component.activeSlot()).toBe(1);

    vi.advanceTimersByTime(500);

    // L'élément actif est maintenant le premier carré (0) de manière continue
    expect(component.activeCarreIndex()).toBe(0);
    expect(component.activeSlot()).toBe(0);
    expect(component.indicatorMarginLeft()).toBe(0);
  });

  it('should calculate indicator progress accurately', () => {
    expect(component.indicatorWidth()).toBeCloseTo(100 / CARRES_MOCK.length, 2);
    expect(component.indicatorMarginLeft()).toBe(0);
  });

  it('should compute activeSlideWidth accurately for desktop and mobile without zooming inactive slide images', () => {
    // Desktop (>= 1024px) : 61.34%
    component.containerWidth.set(1200);
    fixture.detectChanges();
    expect(component.isDesktop()).toBe(true);
    expect(component.activeSlideWidth()).toBeCloseTo(1200 * 0.6134, 2);

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.swiper-container') as HTMLElement;
    expect(container.style.getPropertyValue('--active-slide-width')).toBe(`${1200 * 0.6134}px`);

    // Mobile (< 1024px) : 73.34%
    component.containerWidth.set(800);
    fixture.detectChanges();
    expect(component.isDesktop()).toBe(false);
    expect(component.activeSlideWidth()).toBeCloseTo(800 * 0.7334, 2);
    expect(container.style.getPropertyValue('--active-slide-width')).toBe(`${800 * 0.7334}px`);
  });
});
