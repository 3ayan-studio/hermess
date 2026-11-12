import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AboutComponent } from './about.component';

describe('AboutComponent (Page À Propos ISO Hermès)', () => {
    let component: AboutComponent;
    let fixture: ComponentFixture<AboutComponent>;
    let element: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AboutComponent],
            providers: [provideRouter([])]
        }).compileComponents();

        fixture = TestBed.createComponent(AboutComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should render the hero media block (block-text-on-full-media) with title overlay', () => {
        const heroSection = element.querySelector('#block-text-on-full-media');
        expect(heroSection).not.toBeNull();

        const kicker = heroSection?.querySelector('.editorial-block-intro');
        expect(kicker?.textContent).toContain('À Propos');

        const heroTitle = heroSection?.querySelector('.hero-title');
        expect(heroTitle?.textContent).toContain('HERMESS');
        expect(heroTitle?.textContent).toContain('FATIMA-MARWAZOUZAL');
    });

    it('should render the first editorial text block without title and with new intro text', () => {
        const introBlock = element.querySelector('[data-testid="block-text-intro"]');
        expect(introBlock).not.toBeNull();

        const title = introBlock?.querySelector('.editorial-block-title');
        expect(title).toBeNull();

        const paragraph = introBlock?.querySelector('.editorial-block-text');
        expect(paragraph?.textContent).toContain('Hermess est exposé dans la Project room de la Maison du Shed');
        expect(paragraph?.textContent).toContain("l'enfumade de Dahra en Algérie");
        expect(introBlock?.querySelector('em')?.textContent).toBe('Hermess');

        const link = introBlock?.querySelector('a.link-editorial');
        expect(link).toBeNull();
    });

    it('should render the gallery carousel with media slides without captions', () => {
        const carousel = element.querySelector('[data-testid="gallery-carousel"]');
        expect(carousel).not.toBeNull();

        const slides = carousel?.querySelectorAll('.swiper-slide');
        expect(slides?.length).toBe(6);

        const captions = carousel?.querySelectorAll('.slide-caption');
        expect(captions?.length).toBe(0);
    });

    it('should ensure all videos are configured as living images (autoplay, muted, loop, playsinline, no controls)', () => {
        const videos = element.querySelectorAll('video');
        expect(videos.length).toBeGreaterThan(0);

        videos.forEach((video: HTMLVideoElement) => {
            expect(video.autoplay).toBe(true);
            expect(video.muted || video.hasAttribute('muted')).toBeTruthy();
            expect(video.loop).toBe(true);
            expect(video.controls).toBe(false);
            expect(video.classList.contains('media-video')).toBe(true);
        });
    });

    it('should render the second editorial text block without title and with research text', () => {
        const scenographyBlock = element.querySelector('[data-testid="block-text-scenography"]');
        expect(scenographyBlock).not.toBeNull();

        const title = scenographyBlock?.querySelector('.editorial-block-title');
        expect(title).toBeNull();

        const paragraph = scenographyBlock?.querySelector('.editorial-block-text');
        expect(paragraph?.textContent).toContain("Ce travail s'inscrit dans la continuité du mémoire de Zouzal Fatima-Marwa");
        expect(scenographyBlock?.querySelector('em')?.textContent).toBe('Zouzal ou Zouzali, 2023');
    });

    it('should render the duo-media block with both media columns and no captions', () => {
        const duoBlock = element.querySelector('[data-testid="block-duo-media"]');
        expect(duoBlock).not.toBeNull();

        const columns = duoBlock?.querySelectorAll('.duo-media-col');
        expect(columns?.length).toBe(2);

        const img = duoBlock?.querySelector('.media-left img');
        expect(img).not.toBeNull();

        const video = duoBlock?.querySelector('.media-right video');
        expect(video).not.toBeNull();

        const duoCaptions = duoBlock?.querySelectorAll('.duo-caption');
        expect(duoCaptions?.length).toBe(0);
    });

    it('should render the final CTA button with label EXPLORER L\'UNIVERS pointing to gallery root', () => {
        const ctaButton = element.querySelector('.expo-cta-section a');
        expect(ctaButton).not.toBeNull();
        expect(ctaButton?.getAttribute('routerLink') || ctaButton?.getAttribute('href')).toBe('/');
        expect(ctaButton?.textContent).toContain("EXPLORER L'UNIVERS");
    });

    it('should render navigation controls matching detail view style and support scrollSlide helper', () => {
        const navControls = element.querySelector('.navigation-controls');
        expect(navControls).not.toBeNull();

        const rightBtn = element.querySelector('.carousel-nav-btn.right-control');
        expect(rightBtn).not.toBeNull();

        const track = component.sliderTrack()?.nativeElement;
        expect(track).toBeDefined();

        // Trigger scroll method
        component.onScroll();
        expect(component.canScrollLeft()).toBe(false);

        // Call scrollSlide
        const scrollSpy = vi.fn();
        (track as HTMLElement & { scrollBy: (options: ScrollToOptions) => void }).scrollBy = scrollSpy;
        component.scrollSlide(1);
        expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    });
});
