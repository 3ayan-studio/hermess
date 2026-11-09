import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Carre, CarreMediaItem } from '../../../../core/models/carre.model';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';
import { SvgIconComponent } from '../../../../shared/components/svg-icon/svg-icon.component';

@Component({
  selector: 'app-gallery-panel',
  standalone: true,
  imports: [SvgIconComponent],
  template: `
    <section class="panel-wrapper" aria-label="Présentation et sélection du carré">
      <div
        class="carousel-panel"
        style="--header-height-desktop-with-menu: 110px; --header-menu-height: 46px;"
      >
        <!-- Conteneur Carrousel Slider ISO Hermès -->
        <div class="carousel-container">
          <div
            class="carousel auto-slides"
            aria-roledescription="carousel"
            aria-label="Galerie photo"
          >
            <!-- Piste Swiper scrollable latéralement -->
            <div
              #sliderContainer
              class="swiper-container"
              (scroll)="onScroll()"
              (pointerdown)="onPointerDown($event)"
              (pointermove)="onPointerMove($event)"
              (pointerup)="onPointerUp($event)"
              (pointercancel)="onPointerCancel()"
              tabindex="0"
              role="region"
              aria-label="Piste des photos du carré"
            >
              @for (item of mediaItems(); track item.id; let idx = $index) {
                <div
                  class="swiper-slide"
                  [class.swiper-slide-active]="activeSlideIndex() === idx"
                  role="group"
                  [attr.aria-label]="(idx + 1) + ' / ' + mediaItems().length"
                >
                  <div class="asset-wrapper f34" [id]="'tabpanel-default-' + idx">
                    @if (item.type === 'video') {
                      <div class="slide-video-container" (click)="onSlideClick(item, videoRef)">
                        <video
                          #videoRef
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
                          [poster]="item.poster || item.url"
                          [class.contain-mode]="item.aspectRatio === '1:1' && idx === 0"
                        >
                          @if (item.srcMp4) {
                            <source [src]="item.srcMp4" type="video/mp4" />
                          }
                          @if (item.srcMov) {
                            <source [src]="item.srcMov" type="video/quicktime" />
                          }
                          @if (!item.srcMp4 && !item.srcMov) {
                            <source [src]="item.url" />
                          }
                        </video>

                        <!-- Bouton Pause/Lecture ISO Hermès -->
                        <button
                          type="button"
                          class="video-play-pause-btn"
                          (click)="toggleVideoPlayPause(item, videoRef, $event)"
                          [attr.aria-label]="isVideoPaused(item.id) ? 'Relancer la lecture de la vidéo' : 'Mettre en pause la vidéo'"
                          [title]="isVideoPaused(item.id) ? 'Lecture' : 'Pause'"
                        >
                          @if (isVideoPaused(item.id)) {
                            <!-- Icône Play ISO Hermès (triangle contour fin noir) -->
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <polygon points="2.5,1.5 10.5,6 2.5,10.5" stroke="#000" stroke-width="1.3" stroke-linejoin="round" fill="none" />
                            </svg>
                          } @else {
                            <!-- Icône Pause ISO Hermès (deux barres verticales fines noires) -->
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="3.5" y1="2" x2="3.5" y2="10" stroke="#000" stroke-width="1.5" stroke-linecap="square" />
                              <line x1="8.5" y1="2" x2="8.5" y2="10" stroke="#000" stroke-width="1.5" stroke-linecap="square" />
                            </svg>
                          }
                        </button>
                      </div>
                    } @else {
                      <button
                        type="button"
                        class="slide-image-btn"
                        (click)="onSlideClick(item)"
                        [attr.aria-label]="'Agrandir la vue ' + (idx + 1) + ' sur ' + mediaItems().length"
                      >
                        <img
                          [src]="item.url"
                          [alt]="item.alt || carre().title"
                          [loading]="idx === 0 ? 'eager' : 'lazy'"
                          [class.contain-mode]="idx === 0"
                          [class.cover-mode]="isCoverMode(item)"
                          draggable="false"
                        />
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Espace de fin desktop pour dégager la dernière photo (slides-offset-after="423") -->
              <div class="slides-end-spacer" aria-hidden="true"></div>
            </div>

            <!-- Flèches de navigation latérale -->
            <div class="navigation-controls">
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

            <!-- Pagination Mobile : Points centrés -->
            <div class="mobile-dots-pagination" aria-hidden="true">
              @for (item of mediaItems(); track item.id; let idx = $index) {
                <span class="dot" [class.active]="activeSlideIndex() === idx"></span>
              }
            </div>
          </div>
        </div>

        <!-- Miniatures Galerie Produit (Angle inférieur gauche sur desktop) -->
        @if (mediaItems().length > 1) {
          <div class="images-galery" role="tablist" aria-label="Vues du carré">
            <div class="images-gallery-container">
              <div class="gallery-wrapper">
                @for (item of mediaItems(); track item.id; let idx = $index) {
                  <button
                    type="button"
                    class="gallery-button"
                    [class.checked]="activeSlideIndex() === idx"
                    (click)="scrollToSlide(idx)"
                    [attr.aria-label]="'Afficher la vue ' + (idx + 1)"
                  >
                    <img [src]="item.poster || (item.type === 'image' ? item.url : carre().thumbnail)" [alt]="item.alt || carre().title" />
                  </button>
                }
              </div>
              <!-- Barre animée noire indiquant la vue active -->
              <div
                class="animation-image-gallery"
                [style.transform]="'translateX(' + (activeSlideIndex() * 36) + 'px)'"
              ></div>
            </div>
          </div>
        }

        <!-- Panel Superposé Flottant ISO Hermès (Compact & Ancré en Bas à Droite) -->
        <aside class="selector-panel" aria-label="Détails et écoute de l'échange">
          <div class="selector-template-wrapper">
            <div class="product-selector">
              <!-- En-tête : Titre -->
              <div class="product-header">
                <h1 class="product-title">{{ carre().title }}</h1>
              </div>

              <!-- Sélecteur de carré / coloris Hermès -->
              <div class="selector-container">
                <div class="selector-header">
                  <span class="selector-label">Couleur / Modèle</span>
                  <span class="current-value">{{ carre().colorName }}</span>
                </div>

                <!-- Grille 6 colonnes ISO Hermès -->
                <div
                  class="box-group-grid"
                  role="radiogroup"
                  aria-label="Choisir un carré de l'exposition"
                >
                  @for (item of allCarres(); track item.id) {
                    <button
                      type="button"
                      class="box-image ratio-1-1"
                      [class.selected]="item.id === carre().id"
                      (click)="switchCarre(item.slug)"
                      [title]="item.title + ' — ' + item.colorName"
                    >
                      <div class="image">
                        <img [src]="item.thumbnail" [alt]="item.title" loading="lazy" />
                      </div>
                    </button>
                  }
                </div>
              </div>

              <!-- Bouton d'action principal (Détournement ISO Ajouter au panier) -->
              <div class="product-selector-footer">
                @if (carre().hasInterview && carre().interview; as interview) {
                  <div class="actions">
                    <button
                      type="button"
                      class="button button-color-primary button-layout-full button-radius-small button-size-medium button-variant-filled"
                      (click)="onActionClick()"
                      aria-label="Faire défiler jusqu'à l'écoute de l'échange audio"
                    >
                      <span class="button-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6,4 20,12 6,20"></polygon>
                        </svg>
                      </span>
                      <span class="button-label label-medium">
                        Écouter l’échange
                      </span>
                    </button>

                    <p class="interview-meta">
                      Durée : {{ interview.durationFormatted }}
                    </p>

                    <button
                      type="button"
                      class="transcript-link-btn"
                      (click)="scrollToTranscript()"
                    >
                      <app-svg-icon name="ng__clock" size="13px" customClass="mr-1.5"></app-svg-icon>
                      <span>Lire la transcription de l'échange</span>
                    </button>
                  </div>
                } @else {
                  <div class="contemplation-banner">
                    <span class="contemplation-text">
                      Œuvre Visuelle • Exposition 2026
                    </span>
                  </div>
                }
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Lightbox Plein Écran ISO Hermès -->
    @if (isZoomOpen()) {
      <div
        class="fullscreen-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Vue plein écran"
        (click)="closeZoom()"
      >
        <button
          type="button"
          class="fullscreen-close-btn"
          (click)="closeZoom()"
          aria-label="Fermer le plein écran"
        >
          <app-svg-icon name="ng__cross" size="20px" stroke="#000"></app-svg-icon>
        </button>

        <div class="fullscreen-image-container" (click)="$event.stopPropagation()">
          @if (currentZoomImage(); as zoomImg) {
            <img
              [src]="zoomImg.url"
              [alt]="zoomImg.alt || carre().title"
            />
          }
        </div>

        @if (zoomableImages().length > 1) {
          <button
            type="button"
            class="fullscreen-nav-btn prev"
            (click)="$event.stopPropagation(); prevZoom()"
            aria-label="Image précédente"
          >
            <app-svg-icon name="ng__arrow-left" size="18px" stroke="#000"></app-svg-icon>
          </button>
          <button
            type="button"
            class="fullscreen-nav-btn next"
            (click)="$event.stopPropagation(); nextZoom()"
            aria-label="Image suivante"
          >
            <app-svg-icon name="ng__arrow-right" size="18px" stroke="#000"></app-svg-icon>
          </button>

          <div class="fullscreen-counter" (click)="$event.stopPropagation()">
            {{ zoomIndex() + 1 }} / {{ zoomableImages().length }}
          </div>
        }
      </div>
    }
  `,
  styleUrl: './gallery-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneAGalleryPanelComponent implements OnDestroy {
  private readonly router = inject(Router);
  readonly audioService = inject(AudioPlayerService);

  readonly carre = input.required<Carre>();
  readonly allCarres = input.required<Carre[]>();

  readonly sliderContainer = viewChild<ElementRef<HTMLElement>>('sliderContainer');

  readonly activeSlideIndex = signal<number>(0);
  readonly canScrollLeft = signal<boolean>(false);
  readonly canScrollRight = signal<boolean>(true);

  readonly isZoomOpen = signal<boolean>(false);
  readonly zoomIndex = signal<number>(0);

  private isPointerDragging = false;
  private pointerStartX = 0;
  private pointerStartScrollLeft = 0;
  private hasDragged = false;

  readonly mediaItems = computed<CarreMediaItem[]>(() => {
    return this.carre().media ?? [];
  });

  readonly images = computed<CarreMediaItem[]>(() => this.mediaItems());

  readonly zoomableImages = computed<CarreMediaItem[]>(() => {
    return this.mediaItems().filter(m => m.type === 'image');
  });

  readonly currentZoomImage = computed<CarreMediaItem | null>(() => {
    const list = this.zoomableImages();
    if (list.length === 0) return null;
    return list[this.zoomIndex()] || list[0];
  });

  readonly pausedVideoIds = signal<Set<string>>(new Set<string>());

  isVideoPaused(id: string): boolean {
    return this.pausedVideoIds().has(id);
  }

  isCoverMode(item: CarreMediaItem): boolean {
    return item.url.includes('carre-laures/detail-02');
  }

  toggleVideoPlayPause(item: CarreMediaItem, videoEl: HTMLVideoElement, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const currentlyPaused = this.isVideoPaused(item.id);
    if (currentlyPaused) {
      try {
        const res = videoEl.play();
        if (res && typeof res.catch === 'function') {
          res.catch(() => {});
        }
      } catch {}
      this.pausedVideoIds.update(set => {
        const next = new Set(set);
        next.delete(item.id);
        return next;
      });
    } else {
      try {
        videoEl.pause();
      } catch {}
      this.pausedVideoIds.update(set => {
        const next = new Set(set);
        next.add(item.id);
        return next;
      });
    }
  }

  readonly isCurrentPlaying = computed(() => {
    return this.audioService.currentCarre()?.id === this.carre().id && this.audioService.isPlaying();
  });

  readonly isCurrentStarted = computed(() => {
    return (
      this.audioService.currentCarre()?.id === this.carre().id &&
      this.audioService.currentTime() > 0
    );
  });

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.isZoomOpen()) {
      if (event.key === 'Escape') {
        this.closeZoom();
      } else if (event.key === 'ArrowLeft') {
        this.prevZoom();
      } else if (event.key === 'ArrowRight') {
        this.nextZoom();
      }
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  onScroll(): void {
    const el = this.sliderContainer()?.nativeElement;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    this.canScrollLeft.set(scrollLeft > 10);
    this.canScrollRight.set(scrollLeft + el.clientWidth < el.scrollWidth - 15);

    const slides = el.querySelectorAll<HTMLElement>('.swiper-slide');
    if (slides.length === 0) return;

    let bestIdx = 0;
    let minDiff = Infinity;
    const containerRect = el.getBoundingClientRect();

    slides.forEach((slide, idx) => {
      const rect = slide.getBoundingClientRect();
      const diff = Math.abs(rect.left - containerRect.left);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = idx;
      }
    });

    if (this.activeSlideIndex() !== bestIdx) {
      this.activeSlideIndex.set(bestIdx);
    }
  }

  scrollToSlide(idx: number): void {
    const el = this.sliderContainer()?.nativeElement;
    if (!el) return;
    const slides = el.querySelectorAll<HTMLElement>('.swiper-slide');
    if (slides[idx]) {
      if (typeof slides[idx].scrollIntoView === 'function') {
        slides[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
      this.activeSlideIndex.set(idx);
    }
  }

  scrollSlide(dir: -1 | 1): void {
    const el = this.sliderContainer()?.nativeElement;
    if (!el) return;
    const scrollAmount = Math.max(320, el.clientWidth * 0.65);
    el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  }

  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const el = this.sliderContainer()?.nativeElement;
    if (!el) return;

    this.isPointerDragging = true;
    this.hasDragged = false;
    this.pointerStartX = event.clientX;
    this.pointerStartScrollLeft = el.scrollLeft;
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isPointerDragging) return;
    const deltaX = event.clientX - this.pointerStartX;
    if (Math.abs(deltaX) > 6) {
      this.hasDragged = true;
      const el = this.sliderContainer()?.nativeElement;
      if (el) {
        el.style.scrollBehavior = 'auto';
        el.style.scrollSnapType = 'none';
        el.scrollLeft = this.pointerStartScrollLeft - deltaX;
      }
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isPointerDragging) return;
    this.isPointerDragging = false;

    const el = this.sliderContainer()?.nativeElement;
    if (el) {
      el.style.scrollBehavior = '';
      el.style.scrollSnapType = '';
    }

    if (this.hasDragged) {
      this.onScroll();
      const currentIdx = this.activeSlideIndex();
      this.scrollToSlide(currentIdx);
      setTimeout(() => {
        this.hasDragged = false;
      }, 50);
    }
  }

  onPointerCancel(): void {
    if (!this.isPointerDragging) return;
    this.isPointerDragging = false;
    const el = this.sliderContainer()?.nativeElement;
    if (el) {
      el.style.scrollBehavior = '';
      el.style.scrollSnapType = '';
    }
  }

  onSlideClick(item: CarreMediaItem, videoEl?: HTMLVideoElement): void {
    if (this.hasDragged) return;
    if (item.type === 'video') {
      if (videoEl) {
        this.toggleVideoPlayPause(item, videoEl);
      }
      return;
    }
    const zoomIdx = this.zoomableImages().findIndex(img => img.id === item.id);
    this.openZoom(zoomIdx >= 0 ? zoomIdx : 0);
  }

  openZoom(idx: number): void {
    this.zoomIndex.set(idx);
    this.isZoomOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeZoom(): void {
    this.isZoomOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  prevZoom(): void {
    const count = this.zoomableImages().length;
    if (count === 0) return;
    this.zoomIndex.update(i => (i > 0 ? i - 1 : count - 1));
  }

  nextZoom(): void {
    const count = this.zoomableImages().length;
    if (count === 0) return;
    this.zoomIndex.update(i => (i < count - 1 ? i + 1 : 0));
  }

  switchCarre(slug: string): void {
    if (slug === this.carre().slug) return;
    this.router.navigate(['/carre', slug]);
    this.activeSlideIndex.set(0);
    const el = this.sliderContainer()?.nativeElement;
    if (el) {
      el.scrollTo({ left: 0, behavior: 'instant' });
    }
  }

  onActionClick(): void {
    if (!this.carre().interview) return;
    this.scrollToAudioPlayer();
  }

  scrollToAudioPlayer(): void {
    if (typeof window !== 'undefined') {
      const section = document.getElementById('audio-sticky-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  scrollToTranscript(): void {
    if (typeof window !== 'undefined') {
      const section = document.getElementById('audio-sticky-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
