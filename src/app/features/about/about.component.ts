import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    afterNextRender,
    computed,
    signal,
    viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';

export interface ExpoMediaItem {
    id: string;
    type: 'image' | 'video';
    srcJpg?: string;
    srcMp4?: string;
    srcMov?: string;
    alt: string;
    caption: string;
}

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [RouterLink, SvgIconComponent],
    template: `
    <main class="expo-page" role="main">
      <!-- 1. En-tête Immersif Hero Media (ISO Référence 16 / 17: block-text-on-full-media) -->
      <section
        id="block-text-on-full-media"
        data-testid="block-text-on-full-media"
        class="block-hero-media"
        aria-label="En-tête de l'exposition"
      >
        <div class="media-wrapper">
          <picture class="hero-picture">
            <source srcset="/expo/photo45.jpeg" type="image/jpeg" />
            <img
              src="/expo/photo45.jpeg"
              alt="Scénographie et espace d'exposition Hermess"
              class="hero-media-asset"
              fetchpriority="high"
            />
          </picture>
          <div class="overlay-gradient"></div>
        </div>

        <div class="hero-text-overlay center-text">
          <div class="text-content">
            <span class="editorial-block-intro">À Propos</span>
            <h1 class="editorial-block-title hero-title">
              <span class="hero-title-line">HERMESS</span>
              <span class="hero-title-line">FATIMA-MARWAZOUZAL</span>
            </h1>
          </div>
        </div>
      </section>

      <!-- 2. Premier Bloc Éditorial (ISO block-text : 2 phrases) -->
      <section class="block-text first-block" data-testid="block-text-intro">
        <div class="editorial-container">
          <h2 class="editorial-block-title">L'Étoffe et la Voix</h2>
          <p class="editorial-block-text">
            Conçue comme une immersion au croisement du geste textile et de la parole intime, l'exposition détourne l'iconique carré de soie pour en faire le réceptacle d'histoires vécues. Chaque pièce suspendue dans l'espace dialogue avec un échange sonore au long cours capté au plus près des voix.
          </p>
        </div>
      </section>

      <!-- 3. Carrousel / Slider de Médias (ISO gallery-carousel / Swiper) -->
      <section
        class="gallery-carousel"
        data-testid="gallery-carousel"
        aria-roledescription="carousel"
        aria-label="Galerie photographique et cinémagraphes de l'exposition"
        aria-live="polite"
      >
        <div class="carousel-wrapper">
          <!-- Piste de défilement horizontal -->
          <div
            #sliderTrack
            class="swiper-track"
            (scroll)="onScroll()"
            (pointerdown)="onPointerDown($event)"
            (pointermove)="onPointerMove($event)"
            (pointerup)="onPointerUp($event)"
            (pointercancel)="onPointerCancel()"
            tabindex="0"
            role="region"
            aria-label="Piste des œuvres et archives de l'exposition"
          >
            @for (slide of slides(); track slide.id; let idx = $index) {
              <article
                class="swiper-slide"
                [class.swiper-slide-active]="activeSlideIndex() === idx"
                role="group"
                [attr.aria-label]="(idx + 1) + ' sur ' + slides().length"
              >
                <div class="slide-media-wrapper">
                  @if (slide.type === 'video') {
                    <video
                      autoplay
                      muted
                      [muted]="true"
                      loop
                      playsinline
                      webkit-playsinline
                      [controls]="false"
                      preload="auto"
                      class="media-asset media-video"
                      tabindex="-1"
                      aria-hidden="true"
                    >
                      <source [src]="slide.srcMp4" type="video/mp4" />
                      <source [src]="slide.srcMov" type="video/quicktime" />
                    </video>
                  } @else {
                    <img
                      [src]="slide.srcJpg"
                      [alt]="slide.alt"
                      class="media-asset media-image"
                      loading="lazy"
                      draggable="false"
                    />
                  }
                </div>
                @if (slide.caption) {
                  <p class="slide-caption">{{ slide.caption }}</p>
                }
              </article>
            }
          </div>

          <!-- Contrôles de navigation ISO Vue Détail Hermès -->
          <div class="navigation-controls" aria-hidden="true">
            @if (canScrollLeft()) {
              <button
                type="button"
                class="carousel-nav-btn left-control"
                (click)="scrollSlide(-1)"
                aria-label="Image précédente"
              >
                <app-svg-icon name="ng__arrow-left" size="14px" stroke="#000"></app-svg-icon>
              </button>
            }
            @if (canScrollRight()) {
              <button
                type="button"
                class="carousel-nav-btn right-control"
                (click)="scrollSlide(1)"
                aria-label="Image suivante"
              >
                <app-svg-icon name="ng__arrow-right" size="14px" stroke="#000"></app-svg-icon>
              </button>
            }
          </div>
        </div>
      </section>

      <!-- 4. Second Bloc Éditorial (ISO block-text : 1 phrase d'évocation) -->
      <section class="block-text second-block" data-testid="block-text-scenography">
        <div class="editorial-container">
          <h2 class="editorial-block-title">La Soie Suspendue</h2>
          <p class="editorial-block-text">
            Dans la lumière des salons, les soies flottent librement sans cadre, laissant la matière respirer au rythme des récits.
          </p>
        </div>
      </section>

      <!-- 5. Bloc Duo-Média (ISO Référence 16 / 17: block-duo-media) -->
      <section class="block-duo-media" data-testid="block-duo-media" aria-label="Perspectives et mouvement">
        <div class="duo-media-col media-left">
          <div class="media-container">
            <img
              src="/expo/photo11.jpeg"
              alt="Perspective du salon et banc d'écoute"
              class="media-asset media-image"
              loading="lazy"
            />
          </div>
        </div>

        <div class="duo-media-col media-right">
          <div class="media-container">
            <video
              autoplay
              muted
              [muted]="true"
              loop
              playsinline
              webkit-playsinline
              [controls]="false"
              preload="auto"
              class="media-asset media-video"
              tabindex="-1"
              aria-hidden="true"
            >
              <source src="/expo/video2.mp4" type="video/mp4" />
              <source src="/expo/video2.mov" type="video/quicktime" />
            </video>
          </div>
        </div>
      </section>

      <!-- 6. Appel à l'action final (Bouton Hermès ISO) -->
      <section class="expo-cta-section text-center">
        <a
          routerLink="/"
          class="button button-color-primary button-radius-small button-size-medium button-variant-filled inline-flex"
        >
          <span class="button-label label-medium">EXPLORER L'UNIVERS</span>
        </a>
      </section>
    </main>
  `,
    styleUrl: './about.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {
    readonly sliderTrack = viewChild<ElementRef<HTMLElement>>('sliderTrack');

    // Médias de l'exposition issus de public/expo
    readonly slides = signal<ExpoMediaItem[]>([
        {
            id: 'carre-laures',
            type: 'image',
            srcJpg: '/expo/photo1.jpeg',
            alt: "Carré d'art Hermess — L'Aures imprimé sur sergé de soie",
            caption: ''
        },
        {
            id: 'video-floating',
            type: 'video',
            srcMp4: '/expo/video2.mp4',
            srcMov: '/expo/video2.mov',
            alt: 'Vidéo cinémagraphe du carré flottant au souffle de la pièce',
            caption: ''
        },
        {
            id: 'bordure-soie',
            type: 'image',
            srcJpg: '/expo/photo14.jpeg',
            alt: 'Détail de la bordure et du roulotté sur soie',
            caption: ''
        },
        {
            id: 'contre-jour-soie',
            type: 'image',
            srcJpg: '/expo/photo121.jpeg',
            alt: 'Contre-jour révélant le fil et la transparence du carré',
            caption: 'Lumière traversante et fil de soie'
        },
        {
            id: 'video-salon',
            type: 'video',
            srcMp4: '/expo/video34.mp4',
            srcMov: '/expo/video34.mov',
            alt: 'Vidéo cinémagraphe du salon avec les œuvres suspendues',
            caption: ''
        },
        {
            id: 'carre-alger',
            type: 'image',
            srcJpg: '/expo/photo166.jpeg',
            alt: "Carré d'art Hermess — Alger suspendu dans l'espace",
            caption: ''
        },
        {
            id: 'scenographie-echelle',
            type: 'image',
            srcJpg: '/expo/photo113.jpeg',
            alt: "Mise en place scénographique des carrés d'art",
            caption: ''
        },
        {
            id: 'perspective-atelier',
            type: 'image',
            srcJpg: '/expo/photo142.jpeg',
            alt: 'Perspective scénographique et élévation de la pièce',
            caption: 'Perspective et élévation'
        }
    ]);

    // État du carrousel avec Signals
    readonly activeSlideIndex = signal(0);
    readonly canScrollLeft = signal(false);
    readonly canScrollRight = signal(true);

    // Gestion du pointer drag (desktop)
    private isPointerDown = false;
    private startX = 0;
    private scrollLeftStart = 0;

    constructor() {
        afterNextRender(() => {
            this.updateScrollButtons();
        });
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        this.updateScrollButtons();
    }

    onScroll(): void {
        this.updateScrollButtons();
    }

    updateScrollButtons(): void {
        const el = this.sliderTrack()?.nativeElement;
        if (!el) return;

        // Détection pour environnement jsdom sans moteur de layout
        if (el.scrollWidth === 0 && el.clientWidth === 0) {
            this.canScrollLeft.set(el.scrollLeft > 5);
            this.canScrollRight.set(true);
            return;
        }

        const containerRect = el.getBoundingClientRect();
        const slides = el.querySelectorAll<HTMLElement>('.swiper-slide');
        if (slides.length === 0) return;

        const firstSlide = slides[0];
        const lastSlide = slides[slides.length - 1];

        const firstRect = firstSlide.getBoundingClientRect();
        const lastRect = lastSlide.getBoundingClientRect();

        // En bout de course gauche : premier média calé ou scrollLeft très faible
        const isAtStart = firstRect.left >= containerRect.left - 4 || el.scrollLeft <= 5;
        // En bout de course droite : dernier média entièrement visible ou scrollLeft proche du max
        const isAtEnd = lastRect.right <= containerRect.right + 4 || (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10);

        this.canScrollLeft.set(!isAtStart);
        this.canScrollRight.set(!isAtEnd);

        // Calcul dynamique de l'index actif
        const slideWidth = (firstSlide.offsetWidth || 340) + 2;
        const index = Math.round(el.scrollLeft / slideWidth);
        this.activeSlideIndex.set(Math.min(Math.max(0, index), this.slides().length - 1));
    }

    scrollSlide(direction: number): void {
        const el = this.sliderTrack()?.nativeElement;
        if (!el) return;

        const scrollAmount = Math.max(el.clientWidth * 0.75, 340);
        el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });

        // Réévaluation des boutons après l'animation fluide
        setTimeout(() => this.updateScrollButtons(), 250);
        setTimeout(() => this.updateScrollButtons(), 500);
    }

    onPointerDown(event: PointerEvent): void {
        // Uniquement bouton principal souris
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        const el = this.sliderTrack()?.nativeElement;
        if (!el) return;

        this.isPointerDown = true;
        this.startX = event.pageX;
        this.scrollLeftStart = el.scrollLeft;
    }

    onPointerMove(event: PointerEvent): void {
        if (!this.isPointerDown) return;

        const el = this.sliderTrack()?.nativeElement;
        if (!el) return;

        const deltaX = event.pageX - this.startX;
        el.scrollLeft = this.scrollLeftStart - deltaX;
        this.updateScrollButtons();
    }

    onPointerUp(event: PointerEvent): void {
        this.isPointerDown = false;
        this.updateScrollButtons();
    }

    onPointerCancel(): void {
        this.isPointerDown = false;
        this.updateScrollButtons();
    }
}
