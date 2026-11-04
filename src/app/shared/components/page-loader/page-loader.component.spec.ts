import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageLoaderComponent } from './page-loader.component';
import { LoadingService } from '../../../core/services/loading.service';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

describe('PageLoaderComponent', () => {
  let component: PageLoaderComponent;
  let fixture: ComponentFixture<PageLoaderComponent>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLoaderComponent],
      providers: [
        LoadingService,
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageLoaderComponent);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not render overlay when not loading', () => {
    const overlay = fixture.nativeElement.querySelector('.notification-overlay');
    expect(overlay).toBeNull();
  });

  it('should render ISO Hermès notification-overlay and loader.svg when loading', () => {
    loadingService.startLoader();
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.notification-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.classList.contains('opaque')).toBe(true);

    const img = fixture.nativeElement.querySelector('.image-loader') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/loader.svg');
    expect(img.getAttribute('alt')).toBe('Hermès');
  });
});

