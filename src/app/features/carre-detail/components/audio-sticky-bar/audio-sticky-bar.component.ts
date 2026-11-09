import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { Carre } from '../../../../core/models/carre.model';
import { AudioPlayerService, formatTimeHHMMSS } from '../../../../core/services/audio-player.service';

interface WaveformBar {
  x: number;
  y: number;
  width: number;
  height: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pseudoNoise(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

@Component({
  selector: 'app-audio-sticky-bar',
  standalone: true,
  imports: [],
  template: `
    <div
      class="sticky-bar-container"
      role="region"
      aria-label="Lecteur audio de l'échange"
    >
      <!-- Rangée 1 : Groupe compact, sobre et soigné aligné à gauche -->
      <div class="sticky-header-row">
        <div class="cluster-left">
          <!-- Visuel du carré -->
          <img
            [src]="carre().thumbnail"
            [alt]="carre().title"
            class="track-thumbnail"
            loading="lazy"
          />

          <!-- Nom et statut de l'œuvre -->
          <div class="track-identity">
            <div class="title-with-status">
              <span
                class="status-indicator-dot"
                [class.is-playing]="isCurrentPlaying()"
              ></span>
              <span class="track-title">{{ carre().title }}</span>
            </div>
          </div>

          <span class="cluster-divider" aria-hidden="true"></span>

          <!-- Contrôles Audio (Stop, -10s, Play/Pause, +10s, Mute) -->
          <div class="audio-controls-group">
            <!-- Bouton Arrêter (Carré classique d'annulation/stop) -->
            <button
              type="button"
              class="control-btn stop-btn"
              (click)="onStop()"
              title="Arrêter et revenir au début"
              aria-label="Arrêter la lecture"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="5" width="14" height="14"></rect>
              </svg>
            </button>

            <!-- Bouton Reculer de 10s -->
            <button
              type="button"
              class="control-btn skip-btn"
              (click)="onSkip(-10)"
              title="Reculer de 10 secondes"
              aria-label="Reculer de 10 secondes"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="butt" stroke-linejoin="miter">
                <path d="M3.5 12a8.5 8.5 0 1 0 8.5-8.5c-2.4 0-4.6.98-6.15 2.58L3.5 8.5"/>
                <polyline points="3.5 3.5 3.5 8.5 8.5 8.5"/>
                <text x="12" y="15.2" font-family="'Overpass Mono', monospace" font-size="7.5" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">10</text>
              </svg>
            </button>

            <!-- Bouton Lecture / Pause (Logo noir pur, sans rond de fond) -->
            <button
              type="button"
              class="control-btn play-btn"
              (click)="onPlayPause()"
              [attr.aria-label]="isCurrentPlaying() ? 'Mettre en pause' : 'Lancer la lecture'"
              [title]="isCurrentPlaying() ? 'Mettre en pause' : 'Lancer la lecture'"
            >
              @if (isCurrentPlaying()) {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5.5" y="4" width="4.2" height="16"></rect>
                  <rect x="14.3" y="4" width="4.2" height="16"></rect>
                </svg>
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="play-icon-offset">
                  <path d="M6 4.5l14 7.5-14 7.5z"></path>
                </svg>
              }
            </button>

            <!-- Bouton Avancer de 10s -->
            <button
              type="button"
              class="control-btn skip-btn"
              (click)="onSkip(10)"
              title="Avancer de 10 secondes"
              aria-label="Avancer de 10 secondes"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="butt" stroke-linejoin="miter">
                <path d="M20.5 12a8.5 8.5 0 1 1-8.5-8.5c2.4 0 4.6.98 6.15 2.58l2.35 2.42"/>
                <polyline points="20.5 3.5 20.5 8.5 15.5 8.5"/>
                <text x="12" y="15.2" font-family="'Overpass Mono', monospace" font-size="7.5" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">10</text>
              </svg>
            </button>

            <!-- Bouton Mute / Démuter -->
            <button
              type="button"
              class="control-btn mute-btn"
              (click)="onToggleMute()"
              [title]="audioService.isMuted() ? 'Rétablir le son' : 'Couper le son'"
              [attr.aria-label]="audioService.isMuted() ? 'Rétablir le son' : 'Couper le son'"
            >
              @if (audioService.isMuted()) {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              }
            </button>
          </div>

          <span class="cluster-divider" aria-hidden="true"></span>

          <!-- Durée actuelle et durée totale -->
          <div class="track-timers">
            <span class="current-time">{{ displayCurrentTime() }}</span>
            <span class="timer-separator">/</span>
            <span class="duration-time">{{ displayDuration() }}</span>
          </div>
        </div>
      </div>

      <!-- Rangée 2 : Waveform ultra-fine (traits) réactive au hover avec matérialisation de la prochaine progression -->
      <div
        #waveformContainer
        class="waveform-container"
        (mousemove)="onMouseMove($event)"
        (mouseleave)="onMouseLeave()"
        (click)="onWaveformClick($event)"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
        role="slider"
        tabindex="0"
        [attr.aria-valuenow]="isCurrentCarre() ? audioService.currentTime() : 0"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="isCurrentCarre() && audioService.duration() > 0 ? audioService.duration() : (carre().interview?.durationSeconds || 0)"
        aria-label="Progression de l'échange audio"
      >
        <!-- Badge Tooltip avec Timestamp au survol -->
        @if (hoverTimeFormatted(); as hoverTime) {
          <div
            class="waveform-tooltip"
            [style.left.px]="hoverX()"
          >
            <span class="tooltip-time">{{ hoverTime }}</span>
          </div>
          <!-- Ligne repère verticale au survol -->
          <div
            class="waveform-hover-line"
            [style.left.px]="hoverX()"
            aria-hidden="true"
          ></div>
        }

        <svg
          class="waveform-svg"
          viewBox="0 0 1000 32"
          preserveAspectRatio="none"
          role="presentation"
        >
          <defs>
            <!-- ClipPath Progression Réelle -->
            <clipPath [attr.id]="activeClipId()">
              <rect
                x="0"
                y="0"
                [attr.width]="progressSvgWidth()"
                height="32"
              ></rect>
            </clipPath>

            <!-- ClipPath Matérialisation Prochaine Progression au Hover -->
            <clipPath [attr.id]="hoverClipId()">
              <rect
                x="0"
                y="0"
                [attr.width]="hoverSvgWidth()"
                height="32"
              ></rect>
            </clipPath>
          </defs>

          <!-- CALQUE 1 : Fond - Toutes les barres en off-beige iconique Hermès (#e2d8ce) -->
          <g fill="#e2d8ce">
            @for (bar of bars(); track bar.x) {
              <rect
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.width"
                [attr.height]="bar.height"
              ></rect>
            }
          </g>

          <!-- CALQUE 2 : Matérialisation Hover de la prochaine progression (Anthracite semi-transparent) -->
          @if (hoverPercentage() !== null) {
            <g fill="rgba(0, 0, 0, 0.42)" [attr.clip-path]="'url(#' + hoverClipId() + ')'">
              @for (bar of bars(); track bar.x) {
                <rect
                  [attr.x]="bar.x"
                  [attr.y]="bar.y"
                  [attr.width]="bar.width"
                  [attr.height]="bar.height"
                ></rect>
              }
            </g>
          }

          <!-- CALQUE 3 : Progression Confirmée - Barres en Noir Pur (#000000) -->
          <g fill="#000000" [attr.clip-path]="'url(#' + activeClipId() + ')'">
            @for (bar of bars(); track bar.x) {
              <rect
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.width"
                [attr.height]="bar.height"
              ></rect>
            }
          </g>
        </svg>
      </div>
    </div>
  `,
  styleUrl: './audio-sticky-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioStickyBarComponent {
  readonly audioService = inject(AudioPlayerService);
  readonly carre = input.required<Carre>();
  readonly waveformContainer = viewChild<ElementRef<HTMLDivElement>>('waveformContainer');
  private readonly el = inject(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private observer: IntersectionObserver | null = null;
  readonly isInViewport = signal<boolean>(false);

  private isScrubbing = false;

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.ngZone.runOutsideAngular(() => {
        this.observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            const isIntersecting = entry ? entry.isIntersecting : false;
            this.ngZone.run(() => {
              this.isInViewport.set(isIntersecting);
            });
          },
          { root: null, threshold: 0.05 }
        );
        this.observer.observe(this.el.nativeElement);
      });
    }

    effect(() => {
      const inViewport = this.isInViewport();
      const currentCarre = this.audioService.currentCarre();
      const thisCarre = this.carre();

      const isMatch = inViewport && currentCarre !== null && currentCarre.id === thisCarre.id;
      this.audioService.setExchangePlayerInViewport(isMatch);
    });

    this.destroyRef.onDestroy(() => {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      if (this.audioService.currentCarre()?.id === this.carre().id) {
        this.audioService.setExchangePlayerInViewport(false);
      }
    });
  }

  readonly hoverPercentage = signal<number | null>(null);
  readonly hoverX = signal<number>(0);

  readonly isCurrentCarre = computed(() => {
    return this.audioService.currentCarre()?.id === this.carre().id;
  });

  readonly isCurrentPlaying = computed(() => {
    return this.isCurrentCarre() && this.audioService.isPlaying();
  });

  readonly displayCurrentTime = computed(() => {
    if (this.isCurrentCarre()) {
      return this.audioService.formattedCurrentTime();
    }
    return '00:00:00';
  });

  readonly displayDuration = computed(() => {
    if (this.isCurrentCarre() && this.audioService.duration() > 0) {
      return this.audioService.formattedDuration();
    }
    return this.carre().interview?.durationFormatted || '00:00:00';
  });

  readonly activeClipId = computed(() => `wf-active-${this.carre().id}`);
  readonly hoverClipId = computed(() => `wf-hover-${this.carre().id}`);

  readonly progressSvgWidth = computed(() => {
    if (!this.isCurrentCarre()) return 0;
    const pct = this.audioService.progressPercentage();
    return Math.max(0, Math.min(1000, (pct / 100) * 1000));
  });

  readonly hoverSvgWidth = computed(() => {
    const hoverPct = this.hoverPercentage();
    if (hoverPct === null) return 0;
    return Math.max(0, Math.min(1000, (hoverPct / 100) * 1000));
  });

  readonly hoverTimeFormatted = computed(() => {
    const pct = this.hoverPercentage();
    if (pct === null) return null;
    const dur = this.isCurrentCarre() && this.audioService.duration() > 0
      ? this.audioService.duration()
      : (this.carre().interview?.durationSeconds || 0);
    const targetSeconds = (pct / 100) * dur;
    return formatTimeHHMMSS(targetSeconds);
  });

  // 250 traits verticaux ultra-fins avec fort bruit acoustique et variance non lissée
  readonly bars = computed<WaveformBar[]>(() => {
    const title = this.carre().title || 'carre';
    const seed = hashString(title);
    const count = 250; // Densité élevée de traits (250 barres)
    const step = 1000 / count; // 4px
    const barWidth = 1.5; // Traits très fins
    const barsList: WaveformBar[] = [];

    for (let i = 0; i < count; i++) {
      // 1. Cadence macro du discours (phrases, respiration et pauses d'élocution)
      const phraseEnvelope = Math.sin((i + seed % 47) * 0.05) * 0.5 + 0.5;
      const syllableCadence = Math.sin((i + seed % 23) * 0.28) * 0.5 + 0.5;
      const baseEnergy = 0.2 + 0.8 * (phraseEnvelope * 0.6 + syllableCadence * 0.4);

      // 2. Bruit haute fréquence à forte variance (accidents vocaux et aspérités sonores)
      const noiseA = pseudoNoise(i * 7.91 + seed * 0.13);
      const noiseB = pseudoNoise(i * 19.37 + seed * 0.37);
      const noiseC = pseudoNoise(i * 43.19 + seed * 0.71);
      const noiseMix = noiseA * 0.5 + noiseB * 0.35 + noiseC * 0.15;

      // 3. Modulation non lissée avec rupture dynamique d'une barre à l'autre
      let rawHeight = baseEnergy * 0.35 + noiseMix * 0.65;

      // 4. Crêtes explosives (plosives / attaques toniques) sur ~12% des barres
      if (noiseA > 0.82) {
        rawHeight = Math.min(1.0, rawHeight + 0.4 + noiseB * 0.25);
      }
      // 5. Micro-pauses et silences brefs entre syllabes sur ~10% des barres
      else if (noiseB < 0.14) {
        rawHeight = 0.06 + noiseC * 0.08;
      }

      // Étalement entre 3px et 29px (hauteur conteneur 32px)
      const height = Math.max(3, Math.min(29, Math.round(3 + rawHeight * 26)));
      const y = (32 - height) / 2;

      barsList.push({
        x: Math.round((i * step + (step - barWidth) / 2) * 10) / 10,
        y,
        width: barWidth,
        height
      });
    }

    return barsList;
  });

  onPlayPause(): void {
    if (this.audioService.currentCarre()?.id !== this.carre().id) {
      this.audioService.playCarre(this.carre());
    } else {
      this.audioService.togglePlay();
    }
  }

  onStop(): void {
    if (this.audioService.currentCarre()?.id === this.carre().id) {
      this.audioService.stop();
    }
  }

  onToggleMute(): void {
    this.audioService.toggleMute();
  }

  onSkip(deltaSeconds: number): void {
    if (this.audioService.currentCarre()?.id !== this.carre().id) {
      this.audioService.playCarre(this.carre());
    }
    this.audioService.skip(deltaSeconds);
  }

  onMouseMove(event: MouseEvent): void {
    const el = this.waveformContainer()?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const percentage = (offsetX / rect.width) * 100;

    this.hoverX.set(offsetX);
    this.hoverPercentage.set(percentage);
  }

  onMouseLeave(): void {
    if (!this.isScrubbing) {
      this.hoverPercentage.set(null);
    }
  }

  onPointerDown(event: PointerEvent): void {
    this.isScrubbing = true;
    const target = event.currentTarget as HTMLElement;
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }
    this.onMouseMove(event);
    this.handleScrub(event);
  }

  onPointerMove(event: PointerEvent): void {
    if (this.isScrubbing) {
      this.onMouseMove(event);
      this.handleScrub(event);
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (this.isScrubbing) {
      this.isScrubbing = false;
      const target = event.currentTarget as HTMLElement;
      if (target.releasePointerCapture) {
        try {
          target.releasePointerCapture(event.pointerId);
        } catch {}
      }
    }
    this.onMouseLeave();
  }

  onWaveformClick(event: MouseEvent): void {
    this.handleScrub(event);
  }

  private handleScrub(event: MouseEvent | PointerEvent): void {
    const el = this.waveformContainer()?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

    if (this.audioService.currentCarre()?.id !== this.carre().id) {
      this.audioService.playCarre(this.carre());
    }

    this.audioService.seekByPercentage(percentage);
  }
}
