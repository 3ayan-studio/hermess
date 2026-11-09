import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DisclaimerBannerComponent,
  HERMESS_DISCLAIMER_KEY
} from './disclaimer-banner.component';

class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

describe('DisclaimerBannerComponent', () => {
  let component: DisclaimerBannerComponent;
  let fixture: ComponentFixture<DisclaimerBannerComponent>;
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    mockStorage.clear();
  });

  it('should render the banner when localStorage does not have dismissed key', () => {
    fixture = TestBed.createComponent(DisclaimerBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isDismissed()).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    const banner = compiled.querySelector('.disclaimer-banner');
    expect(banner).toBeTruthy();
    expect(banner?.getAttribute('role')).toBe('region');
    expect(banner?.getAttribute('aria-label')).toBe('Avertissement contenu sensible');

    expect(banner?.textContent).toContain('Contenu sensible :');
    expect(banner?.textContent).toContain(
      'Ce site propose des échanges audio et leurs transcriptions, abordant des récits éprouvants susceptibles de heurter la sensibilité de certains visiteurs.'
    );

    const btn = banner?.querySelector('.disclaimer-btn');
    expect(btn).toBeTruthy();
    expect(btn?.textContent).toContain('Compris');
  });

  it('should not render the banner when localStorage has dismissed key set to true', () => {
    mockStorage.setItem(HERMESS_DISCLAIMER_KEY, 'true');

    fixture = TestBed.createComponent(DisclaimerBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isDismissed()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    const banner = compiled.querySelector('.disclaimer-banner');
    expect(banner).toBeNull();
  });

  it('should dismiss the banner and store value in localStorage when clicked', () => {
    fixture = TestBed.createComponent(DisclaimerBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('.disclaimer-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();

    btn.click();
    fixture.detectChanges();

    expect(component.isDismissed()).toBe(true);
    expect(mockStorage.getItem(HERMESS_DISCLAIMER_KEY)).toBe('true');
    expect(compiled.querySelector('.disclaimer-banner')).toBeNull();
  });
});
