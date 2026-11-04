import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollTopButtonComponent } from './scroll-top-button.component';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ScrollTopButtonComponent', () => {
  let component: ScrollTopButtonComponent;
  let fixture: ComponentFixture<ScrollTopButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollTopButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollTopButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden initially when scroll position is at top', () => {
    expect(component.isVisible()).toBe(false);
    const button = fixture.nativeElement.querySelector('.scroll-top-btn');
    expect(button).toBeTruthy();
    expect(button.classList.contains('is-visible')).toBe(false);
  });

  it('should become visible when user scrolls past threshold', () => {
    // Set scrollY beyond threshold
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.isVisible()).toBe(true);
    const button = fixture.nativeElement.querySelector('.scroll-top-btn');
    expect(button.classList.contains('is-visible')).toBe(true);
  });

  it('should hide again when user scrolls back to top', () => {
    // Scroll down
    Object.defineProperty(window, 'scrollY', { value: 600, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.isVisible()).toBe(true);

    // Scroll back up
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.isVisible()).toBe(false);
  });

  it('should call window.scrollTo with smooth behavior on click', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    component.scrollToTop();

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  it('should trigger scrollToTop when button is clicked in DOM', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const button = fixture.nativeElement.querySelector('.scroll-top-btn');

    button.click();

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  it('should render an arrow icon inside the button', () => {
    const svg = fixture.nativeElement.querySelector('.scroll-top-btn svg.arrow-icon');
    expect(svg).toBeTruthy();
    const path = svg.querySelector('path');
    expect(path).toBeTruthy();
  });
});

