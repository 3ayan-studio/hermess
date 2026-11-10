import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  untracked
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarresDataService } from '../../core/services/carres-data.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { LoadingService } from '../../core/services/loading.service';
import { ZoneAGalleryPanelComponent } from './components/gallery-panel/gallery-panel.component';
import { ZoneBAccordionsComponent } from './components/accordions/accordions.component';
import { AudioStickyBarComponent } from './components/audio-sticky-bar/audio-sticky-bar.component';
import { TranscriptComponent } from './components/transcript/transcript.component';
import { ScrollTopButtonComponent } from './components/scroll-top-button/scroll-top-button.component';
import { HomeQuoteCarouselComponent } from '../home/components/home-quote-carousel/home-quote-carousel.component';

@Component({
  selector: 'app-carre-detail',
  standalone: true,
  imports: [
    RouterLink,
    ZoneAGalleryPanelComponent,
    ZoneBAccordionsComponent,
    AudioStickyBarComponent,
    TranscriptComponent,
    ScrollTopButtonComponent,
    HomeQuoteCarouselComponent
  ],
  template: `
    @if (carre(); as current) {
      <main class="w-full">
        <!-- ZONE A : Carrousel Produit + Panel Flottant Superposé -->
        <app-gallery-panel
          [carre]="current"
          [allCarres]="carresDataService.carres()"
        ></app-gallery-panel>

        <!-- ZONE B : Description & Accordéons ISO Hermès -->
        <app-accordions [carre]="current"></app-accordions>

        <!-- ZONE C : Barre Audio Sticky Top + Transcription de l'Échange (si disponible) OU Citations -->
        @if (current.hasInterview && current.interview) {
          <div id="audio-sticky-section" class="w-full relative scroll-mt-14 lg:scroll-mt-12">
            <app-audio-sticky-bar [carre]="current"></app-audio-sticky-bar>
            <app-transcript [carre]="current" [targetSegmentId]="seg()"></app-transcript>
          </div>
        } @else {
          <!-- Module de citations pour les carrés sans audio/transcription -->
          <app-home-quote-carousel></app-home-quote-carousel>
        }

        <!-- Bouton Remonter en haut de la page ISO Hermès -->
        <app-scroll-top-button></app-scroll-top-button>
      </main>
    } @else {
      <!-- Fallback Carré introuvable -->
      <div class="py-24 text-center">
        <h2 class="font-edito text-2xl text-black">Ce carré d'art n'a pas été trouvé.</h2>
        <a routerLink="/" class="mt-4 inline-block font-primary text-xs uppercase tracking-wider underline">
          Retourner à l'exposition
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarreDetailComponent implements OnDestroy {
  readonly carresDataService = inject(CarresDataService);
  private readonly audioService = inject(AudioPlayerService);
  private readonly loadingService = inject(LoadingService);

  // Reçoit automatiquement les paramètres de route et de requête grâce à withComponentInputBinding()
  readonly slug = input<string>();
  readonly t = input<string>();
  readonly seg = input<string>();

  private handledTimestampKey = '';
  private lastVisitedSlug = '';
  private autoplayTimer: ReturnType<typeof setTimeout> | null = null;

  readonly carre = computed(() => {
    const s = this.slug();
    if (!s) return this.carresDataService.carres()[0];
    return this.carresDataService.getCarreBySlug(s) || this.carresDataService.carres()[0];
  });

  constructor() {
    // 1. Autoplay automatique en non-mute à l'arrivée sur un carré avec interview (délai de 500ms)
    effect(() => {
      const current = this.carre();
      const targetTime = this.t();
      if (!current) return;

      const slug = current.slug;
      if (this.lastVisitedSlug === slug) return;
      this.lastVisitedSlug = slug;

      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
        this.autoplayTimer = null;
      }

      // Si un timestamp ?t= est fourni, l'effet dédié ci-dessous s'en charge
      if (targetTime !== undefined) return;

      if (current.hasInterview && current.interview) {
        untracked(() => {
          const currentTrack = this.audioService.currentCarre();

          // L'autoplay automatique ne doit se lancer QUE si aucun audio n'est actif
          // (si un audio est en cours de lecture ou en pause, l'audio du nouveau carré ne doit pas se lancer).
          if (!currentTrack) {
            this.autoplayTimer = setTimeout(() => {
              if (this.carre()?.slug !== current.slug) return;
              const trackAtTimeout = this.audioService.currentCarre();

              if (!trackAtTimeout) {
                this.audioService.unmute();
                this.audioService.playCarre(current);
              }
            }, 500);
          }
        });
      }
    });

    effect(() => {
      const current = this.carre();
      const targetTime = this.t();
      if (!current || !current.hasInterview || !current.interview || targetTime === undefined) {
        return;
      }

      // Évite les re-déclenchements intempestifs sur la même navigation
      const key = `${current.slug}:${targetTime}`;
      if (this.handledTimestampKey === key) return;
      this.handledTimestampKey = key;

      const seconds = parseFloat(targetTime);
      if (isNaN(seconds)) return;

      this.audioService.unmute();
      this.audioService.playFromTime(current, seconds);
    });

    // Fallback scroll si aucun segment précis n'est spécifié mais qu'un timestamp existe
    effect(() => {
      const targetTime = this.t();
      const targetSeg = this.seg();
      const isLoading = this.loadingService.isLoading();

      if (targetTime !== undefined && !targetSeg && !isLoading) {
        setTimeout(() => {
          const section = document.getElementById('audio-sticky-section');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.autoplayTimer) {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}
