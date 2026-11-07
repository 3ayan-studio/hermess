import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    computed,
    effect,
    inject,
    input,
    signal,
    viewChild
} from '@angular/core';
import { Carre } from '../../../../core/models/carre.model';
import {
    SegmentedTranscript,
    TranscriptSegment
} from '../../../../core/models/transcript.model';
import { AudioPlayerService } from '../../../../core/services/audio-player.service';
import { TranscriptService } from '../../../../core/services/transcript.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { findActiveSegmentIndex } from '../../../../core/utils/binary-search';

export function formatTimestamp(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
}

export function stripHtmlTags(text: string): string {
    return text ? text.replace(/<[^>]*>/g, '') : '';
}

@Component({
    selector: 'app-transcript',
    standalone: true,
    template: `
    <section class="transcript-section" aria-label="Transcription de l'échange">
      <div class="transcript-container">
        <!-- En-tête Éditorial Épuré ISO Hermès -->
        <header class="transcript-header">
          <p class="transcript-subtitle-muted">
            Transcription de l'échange entre
            <span class="redacted-bar" role="img" aria-label="Identité caviardée"></span>
            et Fatima Marwa
          </p>
        </header>

        <!-- Conteneur de transcription (Mode replié avec fondu ou mode déplié complet) -->
        <div
          class="transcript-wrapper"
          [class.is-collapsed]="!isExpanded()"
          [class.is-audio-playing]="isAudioPlaying()"
          (wheel)="onManualScroll()"
          (touchmove)="onManualScroll()"
        >
          <!-- Voile blanc quasi transparent avec Disclaimer Contenu Sensible -->
          <div
            class="transcript-disclaimer-overlay"
            [class.is-hidden]="!isOverlayVisible()"
            (click)="unlockTranscript($event)"
            role="region"
            aria-label="Avertissement contenu sensible et accès à la transcription"
          >
            <div class="transcript-disclaimer-card" (click)="$event.stopPropagation()">
              <div class="disclaimer-title-row">
                <svg
                  class="warning-icon"
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <strong class="warning-bold">Contenu sensible</strong>
              </div>
              <p class="disclaimer-desc">
                Cet enregistrement et sa transcription comportent des récits éprouvants.
              </p>
              <div class="disclaimer-actions">
                <button
                  type="button"
                  class="disclaimer-action-btn unlock-btn"
                  (click)="unlockTranscript($event)"
                  aria-label="Lire la transcription de l'échange"
                >
                  Lire la transcription
                </button>
                <button
                  type="button"
                  class="disclaimer-action-btn play-btn"
                  (click)="playAndUnlock($event)"
                  aria-label="Écouter l'enregistrement audio"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="6,4 20,12 6,20"></polygon>
                  </svg>
                  <span>Écouter</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Dégradé fondu en haut en mode replié pendant la lecture audio -->
          @if (!isExpanded() && isAudioPlaying()) {
            <div class="fade-overlay-top" aria-hidden="true"></div>
          }

          <div
            #scrollContainer
            class="transcript-scroll-area"
            [class.is-collapsed]="!isExpanded()"
            [class.is-audio-playing]="isAudioPlaying()"
            [class.is-veiled]="isOverlayVisible()"
          >
            <!-- État de chargement discret -->
            @if (isLoading()) {
              <div class="transcript-loading" aria-live="polite">
                <span class="loading-text">Chargement de la transcription...</span>
              </div>
            } @else if (segments().length === 0) {
              <div class="transcript-empty">
                <p class="empty-text">Aucune transcription disponible pour cet échange.</p>
              </div>
            } @else {
              <!-- Liste éditoriale des répliques et segments -->
              <div class="transcript-turns-list" role="feed" aria-label="Répliques de l'échange">
                @for (seg of segments(); track seg.id; let idx = $index) {
                  <article
                    class="transcript-turn"
                    [attr.data-segment-id]="seg.id"
                    [attr.data-segment-index]="idx"
                    [class.is-active]="activeSegmentId() === seg.id"
                    [class.is-inactive]="activeSegmentId() !== null && activeSegmentId() !== seg.id && isAudioPlaying()"
                    (click)="onSegmentClick(seg)"
                    (keydown.enter)="onSegmentClick(seg)"
                    (keydown.space)="onSegmentClick(seg); $event.preventDefault()"
                    tabindex="0"
                    role="button"
                    [attr.aria-current]="activeSegmentId() === seg.id ? 'true' : null"
                    [attr.aria-label]="getSpeakerName(seg.speaker) + ' à ' + formatTime(seg.start) + ' : ' + cleanTextForAria(seg.text)"
                  >
                    <!-- Méta de la réplique (Locuteur + Timestamp) -->
                    <div class="turn-meta">
                      <span class="speaker-name">
                        {{ getSpeakerName(seg.speaker) }}
                      </span>
                      <span class="turn-timestamp" [title]="'Démarrer à ' + formatTime(seg.start)">
                        [{{ formatTime(seg.start) }}]
                      </span>
                      @if (getSpeakerRole(seg.speaker); as role) {
                        <span class="speaker-role" aria-hidden="true">• {{ role }}</span>
                      }
                    </div>

                    <!-- Texte de la réplique -->
                    <p class="turn-text" [innerHTML]="seg.text"></p>
                  </article>
                }
              </div>
            }
          </div>

          <!-- Dégradé fondu en bas en mode replié -->
          @if (!isExpanded() && segments().length > 3) {
            <div class="fade-overlay-bottom" aria-hidden="true"></div>
          }
        </div>

        <!-- Bouton de Déploiement / Réduction Hermès -->
        @if (segments().length > 3 && !isOverlayVisible()) {
          <div class="transcript-toggle-wrapper">
            <button
              type="button"
              class="button button-color-secondary button-layout-hug button-radius-small button-size-medium button-variant-filled transcript-toggle-btn"
              (click)="toggleExpanded()"
              [attr.aria-expanded]="isExpanded()"
            >
              <span class="button-label label-medium">
                {{ isExpanded() ? 'Afficher moins' : 'Afficher plus' }}
              </span>
            </button>
          </div>
        }

        <!-- Bouton Flottant : Reprendre le suivi audio (apparaît lors d'un scroll manuel en écoute) -->
        @if (isUserScrolling() && isAudioPlaying()) {
          <div class="resume-follow-container" aria-live="polite">
            <button
              type="button"
              class="resume-follow-btn"
              (click)="resumeAutoScroll()"
              aria-label="Reprendre le suivi audio automatique"
            >
              <span class="pulse-indicator" aria-hidden="true">
                <span class="pulse-ring"></span>
                <span class="pulse-dot"></span>
              </span>
              <span class="resume-follow-label">Reprendre le suivi audio</span>
            </button>
          </div>
        }
      </div>
    </section>
  `,
    styleUrl: './transcript.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranscriptComponent implements OnDestroy {
    readonly audioService = inject(AudioPlayerService);
    readonly transcriptService = inject(TranscriptService);
    readonly loadingService = inject(LoadingService);

    readonly carre = input.required<Carre>();
    readonly targetSegmentId = input<string | undefined>(undefined);
    readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

    // État local (Signals)
    readonly transcript = signal<SegmentedTranscript | null>(null);
    readonly isLoading = signal<boolean>(false);
    readonly isExpanded = signal<boolean>(false);
    readonly isUserScrolling = signal<boolean>(false);

    private lastFoundIndex = -1;
    private currentLoadedSlug = '';
    private scrollInactivityTimer: ReturnType<typeof setTimeout> | null = null;
    private initialScrollDone = false;

    // Calcul des segments disponibles (asynchrones ou fallback mock legacy)
    readonly segments = computed<TranscriptSegment[]>(() => {
        const loaded = this.transcript();
        if (loaded && loaded.segments && loaded.segments.length > 0) {
            return loaded.segments;
        }

        // Fallback de transition si un transcript legacy sous forme d'entrées existe
        const legacy = this.carre().interview?.transcript;
        if (legacy && legacy.length > 0) {
            return legacy.map((entry, idx) => ({
                id: entry.id || `legacy-${idx}`,
                speaker: entry.speaker,
                start: entry.timestampSeconds,
                end: entry.timestampSeconds + 4.0,
                text: entry.text
            }));
        }

        return [];
    });

    // Calcul du statut de lecture
    readonly isAudioPlaying = computed(() => {
        return (
            this.audioService.currentCarre()?.id === this.carre().id &&
            this.audioService.isPlaying()
        );
    });

    readonly isOverlayVisible = computed(() => {
        const cid = this.carre().id;
        if (this.audioService.dismissedDisclaimerCarres().has(cid)) return false;
        if (this.isAudioPlaying()) return false;
        if (this.audioService.currentCarre()?.id === cid && this.audioService.currentTime() > 0) return false;
        return true;
    });

    // Calcul haute performance du segment actif via O(1) / O(log N)
    readonly activeSegmentIndex = computed<number>(() => {
        if (this.audioService.currentCarre()?.id !== this.carre().id) {
            return -1;
        }
        const time = this.audioService.currentTime();
        const segs = this.segments();
        if (segs.length === 0) return -1;

        const idx = findActiveSegmentIndex(segs, time, this.lastFoundIndex, true);
        if (idx !== -1) {
            this.lastFoundIndex = idx;
        }
        return idx;
    });

    readonly activeSegmentId = computed<string | null>(() => {
        const idx = this.activeSegmentIndex();
        const segs = this.segments();
        if (idx >= 0 && idx < segs.length) {
            return segs[idx].id;
        }
        return null;
    });

    constructor() {
        // 1. Chargement asynchrone du transcript segmenté dès que le carré change
        effect(() => {
            const c = this.carre();
            if (!c) return;

            if (c.slug !== this.currentLoadedSlug) {
                this.currentLoadedSlug = c.slug;
                this.lastFoundIndex = -1;
                this.loadTranscriptForCarre(c);
            }
        });

        // 2. Auto-scroll synchronisé fluide
        effect(() => {
            const activeId = this.activeSegmentId();
            const isPlaying = this.isAudioPlaying();
            const userScrolling = this.isUserScrolling();

            if (activeId && isPlaying && !userScrolling) {
                // Exécuter au frame suivant pour laisser le DOM à jour
                requestAnimationFrame(() => {
                    this.scrollToSegment(activeId, true);
                });
            }
        });

        // 3. Réinitialisation du scroll en haut lorsque l'audio est remis à zéro
        effect(() => {
            const isPlaying = this.isAudioPlaying();
            const time = this.audioService.currentTime();

            if (!isPlaying && time === 0) {
                this.lastFoundIndex = -1;
                const container = this.scrollContainer()?.nativeElement;
                if (container && typeof container.scrollTo === 'function' && container.scrollTop > 0) {
                    container.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });

        // 4. Auto-scroll initial vers le segment cible dès que le transcript est prêt et le loader masqué
        effect(() => {
            const targetSeg = this.targetSegmentId();
            const loaded = this.transcript();
            const isLoading = this.loadingService.isLoading();

            if (targetSeg && loaded && !isLoading && !this.initialScrollDone) {
                this.initialScrollDone = true;
                setTimeout(() => {
                    this.scrollToSegmentAndWindow(targetSeg, true);
                }, 120);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.scrollInactivityTimer) {
            clearTimeout(this.scrollInactivityTimer);
        }
    }

    private async loadTranscriptForCarre(c: Carre): Promise<void> {
        if (!c.hasInterview || !c.interview) {
            this.transcript.set(null);
            return;
        }

        this.isLoading.set(true);
        const customUrl = c.interview.transcriptUrl;
        const data = await this.transcriptService.loadTranscript(c.slug, customUrl);
        this.transcript.set(data);
        this.isLoading.set(false);
    }

    /**
     * Fait défiler la vue vers le segment spécifié
     */
    scrollToSegment(segmentId: string, smooth = true): void {
        const container = this.scrollContainer()?.nativeElement;
        if (!container) return;

        const targetEl = container.querySelector(`[data-segment-id="${segmentId}"]`) as HTMLElement;
        if (!targetEl) return;

        if (!this.isExpanded()) {
            // Mode replié : centrage dans le conteneur défilable interne
            const containerRect = container.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            const relativeCenter = targetRect.top - containerRect.top + targetRect.height / 2;
            const containerCenter = containerRect.height / 2;
            const targetScrollTop = container.scrollTop + relativeCenter - containerCenter;

            if (typeof container.scrollTo === 'function') {
                container.scrollTo({
                    top: Math.max(0, Math.round(targetScrollTop)),
                    behavior: smooth ? 'smooth' : 'instant'
                });
            } else {
                container.scrollTop = Math.max(0, Math.round(targetScrollTop));
            }
        } else {
            // Mode déplié : défilement dans la page avec compensation du sticky bar (scroll-margin-top)
            if (typeof targetEl.scrollIntoView === 'function') {
                targetEl.scrollIntoView({
                    behavior: smooth ? 'smooth' : 'instant',
                    block: 'center'
                });
            }
        }
    }

    /**
     * Fait défiler le conteneur interne ET la page pour amener la ligne de transcription au centre
     */
    scrollToSegmentAndWindow(segmentId: string, smooth = true): void {
        const container = this.scrollContainer()?.nativeElement;
        if (!container) return;

        const targetEl = container.querySelector(`[data-segment-id="${segmentId}"]`) as HTMLElement;
        if (!targetEl) return;

        // 1. Défilement interne du conteneur de transcription
        this.scrollToSegment(segmentId, smooth);

        // 2. Défilement de la page pour positionner la transcription et la ligne sous le sticky bar
        if (typeof window !== 'undefined') {
            const audioSticky = document.getElementById('audio-sticky-section');
            if (audioSticky) {
                const headerOffset = 70;
                const targetWindowY = window.scrollY + audioSticky.getBoundingClientRect().top - headerOffset;
                window.scrollTo({
                    top: Math.max(0, Math.round(targetWindowY)),
                    behavior: smooth ? 'smooth' : 'instant'
                });
            }
        }
    }

    /**
     * Gestionnaire d'événement lors d'un scroll manuel utilisateur (wheel ou touchmove)
     */
    onManualScroll(): void {
        if (!this.isAudioPlaying()) return;

        this.isUserScrolling.set(true);

        if (this.scrollInactivityTimer) {
            clearTimeout(this.scrollInactivityTimer);
        }

        // Réactivation automatique après 5 secondes d'inactivité de défilement
        this.scrollInactivityTimer = setTimeout(() => {
            this.isUserScrolling.set(false);
            const activeId = this.activeSegmentId();
            if (activeId) {
                this.scrollToSegment(activeId, true);
            }
        }, 5000);
    }

    /**
     * Clic sur le bouton flottant "Reprendre le suivi audio"
     */
    resumeAutoScroll(): void {
        if (this.scrollInactivityTimer) {
            clearTimeout(this.scrollInactivityTimer);
            this.scrollInactivityTimer = null;
        }
        this.isUserScrolling.set(false);
        const activeId = this.activeSegmentId();
        if (activeId) {
            this.scrollToSegment(activeId, true);
        }
    }

    /**
     * Clic sur un segment pour navigation (Seek)
     */
    onSegmentClick(seg: TranscriptSegment): void {
        if (this.audioService.currentCarre()?.id !== this.carre().id) {
            this.audioService.playCarre(this.carre());
        }

        this.audioService.seekTo(seg.start);
        if (!this.audioService.isPlaying()) {
            this.audioService.togglePlay();
        }

        // Réinitialise le mode scroll manuel pour recentrer immédiatement
        this.resumeAutoScroll();
    }

    unlockTranscript(event?: Event): void {
        if (event) event.stopPropagation();
        this.audioService.dismissDisclaimer(this.carre().id);
    }

    playAndUnlock(event?: Event): void {
        if (event) event.stopPropagation();
        this.audioService.dismissDisclaimer(this.carre().id);
        if (!this.isAudioPlaying()) {
            if (this.audioService.currentCarre()?.id !== this.carre().id) {
                this.audioService.playCarre(this.carre());
            } else {
                this.audioService.play();
            }
        }
    }

    toggleExpanded(): void {
        this.isExpanded.update(v => !v);
        const activeId = this.activeSegmentId();
        if (activeId) {
            setTimeout(() => {
                this.scrollToSegment(activeId, true);
            }, 350);
        }
    }

    getSpeakerName(speakerId: string): string {
        return this.transcriptService.resolveSpeakerName(speakerId, this.transcript()?.metadata);
    }

    getSpeakerRole(speakerId: string): string | undefined {
        return this.transcriptService.resolveSpeakerRole(speakerId, this.transcript()?.metadata);
    }

    formatTime(seconds: number): string {
        return formatTimestamp(seconds);
    }

    cleanTextForAria(text: string): string {
        return stripHtmlTags(text);
    }
}
