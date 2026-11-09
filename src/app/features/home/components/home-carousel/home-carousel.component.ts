import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    computed,
    inject,
    input,
    signal,
    viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Carre } from '../../../../core/models/carre.model';
import { LoadingService } from '../../../../core/services/loading.service';

export interface CarouselSlot {
    slideIndex: number;
    slotOffset: number; // Offset relatif par rapport au centre actuel (-1, 0, +1...)
    carre: Carre;
    isCenter: boolean;
    key: string;
}

@Component({
    selector: 'app-home-carousel',
    standalone: true,
    template: `
    <section class="home-carousel-section" aria-label="Galerie des Carrés d'art">
      <!-- En-tête éditorial ISO Hermès -->
      <div class="block-text">
        <div class="text">
          <h1 class="edito-1">Découvrez l'univers des Carrés Hermess</h1>
        </div>
      </div>

      <!-- Conteneur Carrousel Pleine Largeur ISO Hermès -->
      <div
        #container
        class="swiper-container is-ready-for-swiper is-initialized"
        role="region"
        aria-label="Product theme carousel"
        aria-live="polite"
        [style.--active-slide-width.px]="activeSlideWidth()"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerCancel()"
      >
        <div
          #wrapper
          class="swiper-wrapper"
          [class.no-transition]="!withTransition()"
          [style.transform]="trackTransform()"
        >
          @for (item of displaySlots(); track item.key) {
            <div
              class="swiper-slide is-initialized"
              [class.swiper-slide-active]="item.slotOffset === activeSlot()"
              [class.is-active-slide]="item.slotOffset === activeSlot()"
              [attr.aria-current]="item.slotOffset === activeSlot() ? 'true' : null"
              [attr.aria-label]="item.carre.title"
              (click)="onSlideClick(item.slotOffset, item.carre, $event)"
              tabindex="0"
              (keydown.enter)="onSlideClick(item.slotOffset, item.carre, $event)"
              (keydown.space)="onSlideClick(item.slotOffset, item.carre, $event)"
            >
              <div
                class="panel-slide-container"
                [attr.inert]="item.slotOffset !== activeSlot() ? '' : null"
              >
                <div class="h-stop-bouncing-slide">
                  <div class="media-cta">
                    <div class="media-wrapper is-fill-mode">
                      <div class="media-link">
                        <div class="media-container">
                          @if (item.carre.carouselMedia.type === 'video') {
                            <video
                              autoplay
                              muted
                              [muted]="true"
                              loop
                              playsinline
                              webkit-playsinline
                              [controls]="false"
                              preload="auto"
                              class="full-parent"
                              [poster]="item.carre.carouselMedia.poster || item.carre.thumbnail"
                            >
                              @if (item.carre.carouselMedia.srcMp4) {
                                <source [src]="item.carre.carouselMedia.srcMp4" type="video/mp4" />
                              }
                              @if (item.carre.carouselMedia.srcMov) {
                                <source [src]="item.carre.carouselMedia.srcMov" type="video/quicktime" />
                              }
                              @if (!item.carre.carouselMedia.srcMp4 && !item.carre.carouselMedia.srcMov) {
                                <source [src]="item.carre.carouselMedia.url" />
                              }
                            </video>
                          } @else {
                            <picture>
                              <img
                                [src]="item.carre.carouselMedia.url || item.carre.thumbnail"
                                [alt]="item.carre.title"
                                class="full-parent"
                                loading="lazy"
                                draggable="false"
                              />
                            </picture>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Bouton Pill Hermès superposé -->
        <!-- Affiché UNIQUEMENT sur le slide actif et masqué pendant la transition -->
        @if (currentActiveCarre(); as activeCarre) {
          <div
            class="editorial-cta"
            [class.show]="!isAnimating()"
          >
            <button
              type="button"
              class="button button-color-secondary button-layout-hug button-radius-small button-size-medium button-variant-filled"
              (click)="onButtonClick(activeCarre, $event)"
              tabindex="-1"
            >
              <span class="button-label label-medium">{{ activeCarre.title }}</span>
            </button>
          </div>
        }
      </div>

      <!-- Navigateur de Progression ISO Hermès -->
      <div class="carousel-navigator" aria-hidden="true">
        <div class="navigator">
          <span
            class="indicator"
            [style.width.%]="indicatorWidth()"
            [style.margin-left.%]="indicatorMarginLeft()"
          ></span>
        </div>
      </div>
    </section>
  `,
    styleUrl: './home-carousel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeCarouselComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly router = inject(Router);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly loadingService = inject(LoadingService);

    readonly carres = input.required<Carre[]>();
    readonly container = viewChild<ElementRef<HTMLDivElement>>('container');
    readonly wrapper = viewChild<ElementRef<HTMLDivElement>>('wrapper');

    // Largeur observée du conteneur
    readonly containerWidth = signal<number>(1200);

    // Index absolu du carré actuellement actif (0 à N-1)
    readonly activeCarreIndex = signal<number>(0);

    // Slot visuellement actif lors de l'animation (-1, 0, +1)
    readonly activeSlot = signal<number>(0);

    // Verrou pendant l'animation pour empêcher les clics en cascade et masquer le bouton
    readonly isAnimating = signal<boolean>(false);

    // Contrôle de l'animation CSS (désactivée lors des normalisations transparentes)
    readonly withTransition = signal<boolean>(true);

    // Décalage en pixels lors du drag/swipe
    readonly dragOffset = signal<number>(0);

    // État du pointeur
    private isPointerDown = false;
    private pointerStartX = 0;
    private pointerStartY = 0;
    private pointerStartTime = 0;
    private hasDragged = false;
    private resizeObserver?: ResizeObserver;
    private slideTimeout?: ReturnType<typeof setTimeout>;

    // Index du slide physique dans le buffer des 15 slides (3 séries de N)
    readonly activeSlideIndex = computed(() => {
        const total = this.carres().length;
        if (!total) return 0;
        return total + this.activeCarreIndex() + this.activeSlot();
    });

    // Carré actuellement actif pour le bouton pill
    readonly currentActiveCarre = computed(() => {
        const list = this.carres();
        if (!list.length) return undefined;
        const total = list.length;
        const idx = ((this.activeCarreIndex() % total) + total) % total;
        return list[idx];
    });

    // Mode Desktop (>= 1024px) vs Mobile (< 1024px)
    readonly isDesktop = computed(() => this.containerWidth() >= 1024);

    // Largeur exacte du slide actif ISO Hermès en pixels (61.34% desktop, 73.34% mobile)
    readonly activeSlideWidth = computed(() => {
        const w = this.containerWidth();
        return this.isDesktop() ? 0.6134 * w : 0.7334 * w;
    });

    // 15 Slides persistantes (3 séries de N carrés : Set 0, Set 1, Set 2)
    // Garantit l'identité immuable des nœuds DOM : AUCUN échange d'images ou de vidéos à chaud !
    readonly displaySlides = computed<CarouselSlot[]>(() => {
        const list = this.carres();
        const total = list.length;
        if (!total) return [];

        const slides: CarouselSlot[] = [];
        const baseCenter = total + this.activeCarreIndex();

        for (let set = 0; set < 3; set++) {
            for (let i = 0; i < total; i++) {
                const slideIndex = set * total + i;
                const slotOffset = slideIndex - baseCenter;
                slides.push({
                    slideIndex,
                    slotOffset,
                    carre: list[i],
                    isCenter: slotOffset === 0,
                    key: `set-${set}-${list[i].id}`
                });
            }
        }

        return slides;
    });

    // Alias pour compatibilité avec l'API publique
    readonly displaySlots = this.displaySlides;

    // Largeur de l'indicateur sur la barre de 120px
    readonly indicatorWidth = computed(() => {
        const total = this.carres().length;
        if (total <= 1) return 100;
        return 100 / total;
    });

    // Marge gauche de l'indicateur pour suivre l'élément actif
    readonly indicatorMarginLeft = computed(() => {
        return this.activeCarreIndex() * this.indicatorWidth();
    });

    // Calcul mathématique exact de la translation ISO Hermès
    // Chaque slide inactif + gap mesure exactement 0.09665 * w (Desktop) ou 0.1333 * w (Mobile)
    readonly trackTransform = computed(() => {
        const w = this.containerWidth();
        const idx = this.activeSlideIndex();
        const drag = this.dragOffset();

        if (this.isDesktop()) {
            // DESKTOP :
            // - Slide actif au centre : 61.34% de la largeur
            // - Base offset de centrage : (1 - 0.6134) / 2 = 0.1933 * w
            // - Pas inter-slide : (38.66% - 16px) / 4 + 4px = 0.09665 * w
            const baseOffset = 0.1933 * w;
            const step = 0.09665 * w;
            const x = baseOffset - idx * step + drag;
            return `translate3d(${x}px, 0, 0)`;
        } else {
            // MOBILE :
            // - Slide actif au centre : 73.34% de la largeur
            // - Base offset de centrage : (1 - 0.7334) / 2 = 0.1333 * w
            // - Pas inter-slide : (26.66% - 8px) / 2 + 4px = 0.1333 * w
            const baseOffset = 0.1333 * w;
            const step = 0.1333 * w;
            const x = baseOffset - idx * step + drag;
            return `translate3d(${x}px, 0, 0)`;
        }
    });

    ngOnInit(): void {
        if (typeof window !== 'undefined') {
            this.containerWidth.set(window.innerWidth);

            if (typeof ResizeObserver !== 'undefined') {
                this.resizeObserver = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                        const width = entry.contentRect.width;
                        if (width > 0) {
                            this.containerWidth.set(width);
                        }
                    }
                });
            }
        }
    }

    ngAfterViewInit(): void {
        if (typeof window !== 'undefined') {
            if (this.resizeObserver && this.container()?.nativeElement) {
                this.resizeObserver.observe(this.container()!.nativeElement);
            }
            this.updateVideosPlayback();
        }
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
        if (this.slideTimeout) {
            clearTimeout(this.slideTimeout);
        }
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        if (typeof window !== 'undefined') {
            this.containerWidth.set(window.innerWidth);
        }
    }

    @HostListener('keydown.arrowleft')
    onArrowLeft(): void {
        this.goToRelative(-1);
    }

    @HostListener('keydown.arrowright')
    onArrowRight(): void {
        this.goToRelative(1);
    }

    // Déplacement relatif d'un nombre de crans (-2, -1, +1, +2)
    goToRelative(offset: number): void {
        if (this.isAnimating() || offset === 0) return;

        const total = this.carres().length;
        if (total <= 0) return;

        if (this.slideTimeout) {
            clearTimeout(this.slideTimeout);
        }

        this.isAnimating.set(true);
        this.withTransition.set(true);
        this.activeSlot.set(offset);

        // Durée de la transition CSS (0.5s = 500ms)
        this.slideTimeout = setTimeout(() => {
            const nextCarreIndex = ((this.activeCarreIndex() + offset) % total + total) % total;

            // 1. Coupe temporairement toute transition pour normalisation silencieuse
            this.withTransition.set(false);

            // 2. Met à jour l'index absolu et réaligne le slot actif sur 0
            this.activeCarreIndex.set(nextCarreIndex);
            this.activeSlot.set(0);

            // 3. Force la détection synchrone
            this.cdr.detectChanges();

            // 4. Force le reflow synchrone pour figer immédiatement la position
            if (this.container()?.nativeElement) {
                void this.container()!.nativeElement.offsetHeight;
            }

            // 5. Rétablit la transition pour la prochaine interaction au frame suivant
            requestAnimationFrame(() => {
                this.withTransition.set(true);
                this.isAnimating.set(false);
                this.updateVideosPlayback();
            });
        }, 500);
    }

    onSlideClick(offset: number, carre: Carre, event?: Event): void {
        if (this.hasDragged) {
            this.hasDragged = false;
            return;
        }

        if (this.isAnimating()) return;

        if (offset === this.activeSlot()) {
            // Clic sur le slide déjà actif : ouvre la fiche du carré
            this.openCarre(carre.slug);
        } else {
            // Clic sur un slide adjacent : transitionne vers ce slide
            this.goToRelative(offset);
        }
    }

    onButtonClick(carre: Carre, event?: Event): void {
        event?.stopPropagation();
        this.openCarre(carre.slug);
    }

    openCarre(slug: string): void {
        this.loadingService.startLoader();
        this.router.navigate(['/carre', slug]);
    }

    // Lecture continue de toutes les vidéos du carrousel (actives et non-actives/peek)
    private updateVideosPlayback(): void {
        if (typeof window === 'undefined' || !this.wrapper()?.nativeElement) return;
        const videos = this.wrapper()!.nativeElement.querySelectorAll('video');
        videos.forEach((video: HTMLVideoElement) => {
            video.muted = true;
            if (video.paused) {
                video.play()?.catch(() => {});
            }
        });
    }

    // Gestion du Drag / Swipe tactile et souris
    onPointerDown(e: PointerEvent): void {
        if (e.button !== 0 || this.isAnimating()) return;
        this.isPointerDown = true;
        this.hasDragged = false;
        this.pointerStartX = e.clientX;
        this.pointerStartY = e.clientY;
        this.pointerStartTime = Date.now();
        this.dragOffset.set(0);
    }

    onPointerMove(e: PointerEvent): void {
        if (!this.isPointerDown || this.isAnimating()) return;
        const deltaX = e.clientX - this.pointerStartX;
        const deltaY = e.clientY - this.pointerStartY;

        if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
            this.hasDragged = true;
            this.dragOffset.set(deltaX * 0.35);
        }
    }

    onPointerUp(e: PointerEvent): void {
        if (!this.isPointerDown) return;
        this.isPointerDown = false;
        const deltaX = e.clientX - this.pointerStartX;
        const elapsed = Date.now() - this.pointerStartTime;
        this.dragOffset.set(0);

        if (this.isAnimating()) return;

        if (Math.abs(deltaX) > 40 || (Math.abs(deltaX) > 20 && elapsed < 250)) {
            if (deltaX < 0) {
                this.goToRelative(1);
            } else {
                this.goToRelative(-1);
            }
        }
    }

    onPointerCancel(): void {
        this.isPointerDown = false;
        this.dragOffset.set(0);
    }
}
