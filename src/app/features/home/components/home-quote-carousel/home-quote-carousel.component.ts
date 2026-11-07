import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { AudioQuote } from '../../../../core/models/quote.model';
import { QuotesDataService } from '../../../../core/services/quotes-data.service';
import { CarresDataService } from '../../../../core/services/carres-data.service';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';

export interface QuoteSlideItem {
  key: string;
  quote: AudioQuote;
  isReal: boolean;
  realIndex: number;
}

@Component({
  selector: 'app-home-quote-carousel',
  standalone: true,
  template: `
    @if (quotes().length > 0) {
      <section
        class="home-quote-section"
        role="region"
        aria-roledescription="carousel"
        aria-label="Citations des récits audio de l'exposition"
        tabindex="0"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
        (mousemove)="onMouseMove()"
        (focusin)="onFocusIn()"
        (focusout)="onFocusOut()"
        (keydown.arrowleft)="onKeyArrowLeft($event)"
        (keydown.arrowright)="onKeyArrowRight($event)"
      >
        <div class="quote-container">
          <!-- Séparateur éditorial discret -->
          <div class="editorial-divider" aria-hidden="true"></div>

          <!-- Viewport Slider continu horizontal -->
          <div
            #viewport
            class="quotes-slider-viewport"
            aria-live="polite"
            (pointerdown)="onPointerDown($event)"
            (pointermove)="onPointerMove($event)"
            (pointerup)="onPointerUp($event)"
            (pointercancel)="onPointerCancel($event)"
          >
            <div
              class="quotes-slider-track"
              [class.no-transition]="!withTransition()"
              [style.transform]="trackTransform()"
            >
              @for (item of displaySlides(); track item.key; let idx = $index) {
                <article
                  class="quote-slide"
                  [class.is-active]="item.isReal && item.realIndex === activeIndex()"
                  [attr.aria-hidden]="!item.isReal || item.realIndex !== activeIndex() ? 'true' : null"
                  [attr.inert]="!item.isReal || item.realIndex !== activeIndex() ? '' : null"
                  role="group"
                  [attr.aria-label]="item.isReal ? ('Citation ' + (item.realIndex + 1) + ' sur ' + quotes().length) : null"
                >
                  <!-- Corps de la citation -->
                  <blockquote class="quote-body">
                    <p class="quote-text">
                      <span class="quote-mark" aria-hidden="true">«&nbsp;</span><span class="quote-content" [innerHTML]="item.quote.quote"></span><span class="quote-mark" aria-hidden="true">&nbsp;»</span>
                    </p>
                  </blockquote>

                  <!-- Nom du carré en muted -->
                  <div class="quote-attribution">
                    <span class="carre-title">{{ item.quote.carreTitle }}</span>
                  </div>

                  <!-- Bouton d'action et lien vers l'audio calé ou le texte de l'œuvre -->
                  <div class="quote-action">
                    @if (item.quote.type === 'artwork') {
                      <button
                        type="button"
                        class="listen-button artwork-button"
                        (click)="onOpenQuote(item.quote, $event)"
                        [attr.tabindex]="item.isReal && item.realIndex === activeIndex() ? 0 : -1"
                      >
                        <svg
                          class="icon-read"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        <span>Lire plus</span>
                        <span class="arrow" aria-hidden="true">→</span>
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="listen-button"
                        (click)="onOpenQuote(item.quote, $event)"
                        [attr.tabindex]="item.isReal && item.realIndex === activeIndex() ? 0 : -1"
                      >
                        <svg
                          class="icon-play"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>Écouter l'extrait ({{ item.quote.timestampFormatted }})</span>
                        <span class="arrow" aria-hidden="true">→</span>
                      </button>
                    }
                  </div>
                </article>
              }
            </div>
          </div>

          <!-- Points de pagination ISO Hermès -->
          @if (quotes().length > 1) {
            <nav class="quote-pagination" aria-label="Pagination des citations">
              @for (item of quotes(); track item.id; let idx = $index) {
                <button
                  type="button"
                  class="pagination-bullet"
                  [class.is-active]="idx === activeIndex()"
                  [attr.aria-current]="idx === activeIndex() ? 'true' : null"
                  [attr.aria-label]="'Aller à la citation ' + (idx + 1)"
                  (click)="goToQuote(idx)"
                ></button>
              }
            </nav>
          }
        </div>
      </section>
    }
  `,
  styleUrl: './home-quote-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeQuoteCarouselComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly quotesDataService = inject(QuotesDataService);
  private readonly carresDataService = inject(CarresDataService);
  private readonly audioPlayerService = inject(AudioPlayerService);

  readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');

  readonly customQuotes = input<AudioQuote[] | null>(null, { alias: 'quotes' });
  readonly quotes = computed<AudioQuote[]>(() => this.customQuotes() ?? this.quotesDataService.quotes());

  // Index absolu de la citation réelle active (0 à N-1)
  readonly activeIndex = signal<number>(0);

  // Position dans la piste (0: clone du dernier, 1..N: réels, N+1: clone du premier)
  readonly trackIndex = signal<number>(1);

  // Animation active et verrouillage pendant la transition
  readonly isAnimating = signal<boolean>(false);
  readonly withTransition = signal<boolean>(true);

  // État de drag / swipe physique 1:1
  readonly isDragging = signal<boolean>(false);
  readonly dragOffset = signal<number>(0);

  readonly isPaused = signal<boolean>(false);
  readonly isHovered = signal<boolean>(false);
  readonly isFocused = signal<boolean>(false);

  // Slides affichées incluant les clones aux extrémités pour la boucle infinie
  readonly displaySlides = computed<QuoteSlideItem[]>(() => {
    const list = this.quotes();
    const total = list.length;
    if (total === 0) return [];
    if (total === 1) {
      return [{ key: `real-${list[0].id}`, quote: list[0], isReal: true, realIndex: 0 }];
    }

    const last = list[total - 1];
    const first = list[0];

    return [
      { key: `clone-last-${last.id}`, quote: last, isReal: false, realIndex: total - 1 },
      ...list.map((q, idx) => ({ key: `real-${q.id}`, quote: q, isReal: true, realIndex: idx })),
      { key: `clone-first-${first.id}`, quote: first, isReal: false, realIndex: 0 }
    ];
  });

  // Calcul exact du translate3d pour la piste continue
  readonly trackTransform = computed(() => {
    const total = this.quotes().length;
    if (total <= 1) return 'none';
    const idx = this.trackIndex();
    const drag = this.dragOffset();
    if (drag !== 0) {
      return `translate3d(calc(-${idx * 100}% + ${drag}px), 0, 0)`;
    }
    return `translate3d(-${idx * 100}%, 0, 0)`;
  });

  private autoPlayTimer?: ReturnType<typeof setInterval>;
  private readonly autoPlayIntervalMs = 7000;

  // État pointeur
  private isPointerDown = false;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private pointerStartTime = 0;
  private hasDragged = false;
  private readonly dragThreshold = 40;
  private readonly fastFlickThreshold = 20;
  private activePointerId: number | null = null;
  private dragResetTimer?: ReturnType<typeof setTimeout>;
  private resetTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const q = this.quotes();
      if (q.length <= 1) {
        this.trackIndex.set(0);
        this.activeIndex.set(0);
      } else if (this.trackIndex() === 0) {
        this.trackIndex.set(this.activeIndex() + 1);
      }
    });
  }

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    if (this.dragResetTimer) {
      clearTimeout(this.dragResetTimer);
    }
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    if (typeof window === 'undefined') return;

    this.autoPlayTimer = setInterval(() => {
      if (!this.isPaused() && this.quotes().length > 1 && !this.isDragging()) {
        this.nextQuote();
      }
    }, this.autoPlayIntervalMs);
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = undefined;
    }
  }

  pauseAutoPlay(): void {
    this.isPaused.set(true);
    this.stopAutoPlay();
  }

  resumeAutoPlay(): void {
    this.isPaused.set(false);
    if (!this.isHovered() && !this.isFocused() && !this.isDragging()) {
      this.startAutoPlay();
    }
  }

  onMouseEnter(): void {
    this.isHovered.set(true);
    this.pauseAutoPlay();
  }

  onMouseLeave(): void {
    this.isHovered.set(false);
    if (!this.isFocused()) {
      this.resumeAutoPlay();
    }
  }

  onMouseMove(): void {
    if (!this.isHovered()) {
      this.onMouseEnter();
    }
  }

  onFocusIn(): void {
    this.isFocused.set(true);
    this.pauseAutoPlay();
  }

  onFocusOut(): void {
    this.isFocused.set(false);
    if (!this.isHovered()) {
      this.resumeAutoPlay();
    }
  }

  nextQuote(): void {
    const total = this.quotes().length;
    if (total <= 1 || this.isAnimating()) return;

    this.isAnimating.set(true);
    this.withTransition.set(true);

    const nextTrack = this.trackIndex() + 1;
    const nextActive = (this.activeIndex() + 1) % total;

    this.trackIndex.set(nextTrack);
    this.activeIndex.set(nextActive);

    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    // Si on a atteint le clone de fin (au-delà des slides réelles)
    if (nextTrack > total) {
      this.resetTimeout = setTimeout(() => {
        this.withTransition.set(false);
        this.trackIndex.set(1);
        if (this.viewport()?.nativeElement) {
          void this.viewport()!.nativeElement.offsetHeight;
        }
        setTimeout(() => {
          this.withTransition.set(true);
          this.isAnimating.set(false);
        }, 30);
      }, 450);
    } else {
      this.resetTimeout = setTimeout(() => {
        this.isAnimating.set(false);
      }, 450);
    }
  }

  prevQuote(): void {
    const total = this.quotes().length;
    if (total <= 1 || this.isAnimating()) return;

    this.isAnimating.set(true);
    this.withTransition.set(true);

    const prevTrack = this.trackIndex() - 1;
    const prevActive = (this.activeIndex() - 1 + total) % total;

    this.trackIndex.set(prevTrack);
    this.activeIndex.set(prevActive);

    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    // Si on a atteint le clone de début (slot 0)
    if (prevTrack === 0) {
      this.resetTimeout = setTimeout(() => {
        this.withTransition.set(false);
        this.trackIndex.set(total);
        if (this.viewport()?.nativeElement) {
          void this.viewport()!.nativeElement.offsetHeight;
        }
        setTimeout(() => {
          this.withTransition.set(true);
          this.isAnimating.set(false);
        }, 30);
      }, 450);
    } else {
      this.resetTimeout = setTimeout(() => {
        this.isAnimating.set(false);
      }, 450);
    }
  }

  goToQuote(index: number): void {
    const current = this.activeIndex();
    if (index === current || this.isAnimating()) return;
    const total = this.quotes().length;
    if (index >= 0 && index < total) {
      this.isAnimating.set(true);
      this.withTransition.set(true);
      this.activeIndex.set(index);
      this.trackIndex.set(index + 1);

      if (this.resetTimeout) {
        clearTimeout(this.resetTimeout);
      }
      this.resetTimeout = setTimeout(() => {
        this.isAnimating.set(false);
      }, 450);

      // Réinitialise le compte à rebours de l'autoplay pour offrir les 7s complètes
      if (!this.isPaused() && !this.isHovered() && !this.isFocused()) {
        this.startAutoPlay();
      }
    }
  }

  // Gestion du Drag / Swipe physique 1:1
  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this.quotes().length <= 1 || this.isAnimating()) return;

    // Si le geste commence sur un bouton ou lien interactif, ne pas démarrer de drag
    if ((event.target as HTMLElement)?.closest('button, a')) {
      return;
    }

    this.isPointerDown = true;
    this.hasDragged = false;
    this.isDragging.set(false);
    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
    this.pointerStartTime = Date.now();
    this.dragOffset.set(0);
    this.activePointerId = event.pointerId;

    this.pauseAutoPlay();
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isPointerDown || (this.activePointerId !== null && event.pointerId !== this.activePointerId)) return;

    const deltaX = event.clientX - this.pointerStartX;
    const deltaY = event.clientY - this.pointerStartY;

    if (!this.isDragging()) {
      // Défilement vertical natif prioritaire
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        this.releasePointer(event);
        return;
      }

      if (Math.abs(deltaX) > 8) {
        this.isDragging.set(true);
        this.hasDragged = true;
        this.withTransition.set(false); // Suivi direct 1:1 sans latence
        try {
          (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId);
        } catch {
          // Ignorer si non supporté
        }
      }
    }

    if (this.isDragging()) {
      this.dragOffset.set(deltaX); // Déplacement 1:1 direct sous le pointeur
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isPointerDown || (this.activePointerId !== null && event.pointerId !== this.activePointerId)) return;

    const deltaX = event.clientX - this.pointerStartX;
    const elapsed = Date.now() - this.pointerStartTime;

    this.releasePointer(event);
    const wasDragging = this.isDragging();
    this.isDragging.set(false);
    this.dragOffset.set(0);
    this.withTransition.set(true);

    if (wasDragging) {
      if (deltaX < -this.dragThreshold || (deltaX < -this.fastFlickThreshold && elapsed < 300)) {
        this.nextQuote();
      } else if (deltaX > this.dragThreshold || (deltaX > this.fastFlickThreshold && elapsed < 300)) {
        this.prevQuote();
      }
      // Si seuil non atteint, la piste revient élastiquement et naturellement sur trackIndex
    }

    if (!this.isHovered() && !this.isFocused()) {
      this.resumeAutoPlay();
    }

    if (this.hasDragged) {
      if (this.dragResetTimer) {
        clearTimeout(this.dragResetTimer);
      }
      this.dragResetTimer = setTimeout(() => {
        this.hasDragged = false;
      }, 120);
    }
  }

  onPointerCancel(event: PointerEvent): void {
    if (!this.isPointerDown || (this.activePointerId !== null && event.pointerId !== this.activePointerId)) return;
    this.releasePointer(event);
    this.dragOffset.set(0);
    this.isDragging.set(false);
    this.withTransition.set(true);
    if (!this.isHovered() && !this.isFocused()) {
      this.resumeAutoPlay();
    }
    this.hasDragged = false;
  }

  private releasePointer(event: PointerEvent): void {
    this.isPointerDown = false;
    try {
      if (this.activePointerId !== null) {
        (event.currentTarget as HTMLElement)?.releasePointerCapture?.(this.activePointerId);
      }
    } catch {
      // Ignorer
    }
    this.activePointerId = null;
  }

  onKeyArrowLeft(event: Event): void {
    event.preventDefault();
    this.prevQuote();
    if (!this.isPaused() && !this.isHovered() && !this.isFocused()) {
      this.startAutoPlay();
    }
  }

  onKeyArrowRight(event: Event): void {
    event.preventDefault();
    this.nextQuote();
    if (!this.isPaused() && !this.isHovered() && !this.isFocused()) {
      this.startAutoPlay();
    }
  }

  onListenQuote(quote: AudioQuote, event?: Event): void {
    this.onOpenQuote(quote, event);
  }

  onOpenQuote(quote: AudioQuote, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.hasDragged) {
      return;
    }

    if (quote.type === 'artwork') {
      const target = quote.routeUrl || '/her-story-her-mess';
      this.router.navigate([target]).then(() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      });
      return;
    }

    if (quote.carreSlug) {
      const carre = this.carresDataService.getCarreBySlug(quote.carreSlug);
      if (carre && quote.timestampSeconds !== undefined) {
        this.audioPlayerService.playFromTime(carre, quote.timestampSeconds);
      }

      this.router.navigate(['/carre', quote.carreSlug], {
        queryParams: {
          t: quote.timestampSeconds,
          seg: quote.segmentId
        }
      });
    }
  }
}
