import { ChangeDetectionStrategy, Component, DestroyRef, inject, NgZone, signal, computed } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { ArtworkTextService } from '../../../core/services/artwork-text.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, SvgIconComponent],
    template: `
    <header class="header-container" [class.background-white]="isHeaderWhite()" role="banner">
      <!-- Spacer pour compenser le header fixed sans layout shift -->
      <div class="header-background-fixed"></div>

      <div
        class="header-main-container fixed"
        [class.menu-elevated]="isMenuOpen()"
        [class.hide-header-bar]="isScrolled() && !isMenuOpen()"
        [class.audio-expanded]="isMobileAudioExpanded()"
        [class.background-white]="isHeaderWhite()"
      >
        <div class="header-main">
          <div class="header-bar">
            <!-- Icônes / Menu à gauche (Burger uniquement en mobile) -->
            <div class="header-bar-icons header-bar-left">
              <div class="menu">
                <button
                  type="button"
                  id="burger-menu"
                  class="button button-icon button-not-black"
                  (click)="openMenu()"
                  [attr.aria-expanded]="isMenuOpen()"
                  aria-label="Menu"
                >
                  <app-svg-icon name="ng__bars" size="20px" stroke="#000"></app-svg-icon>
                  <span class="icon-label paragraph-small">Menu</span>
                </button>
              </div>
            </div>

            <!-- Logo Hermès officiel centré -->
            <div class="header-logo-container">
              <h1 class="sr-only">Hermess Alger — Exposition Carrés d'Art</h1>
              <div class="header-hermes-container">
                <a routerLink="/" class="header-hermes-logo" aria-label="Hermess Alger — Accueil">
                  <!-- Logo Mobile (< 1024px) : logo sans texte (calèche Hermès ISO) -->
                  <svg class="icon-hermes-logo-small" viewBox="0 0 295.30401 146.1581" width="100%" height="100%" role="presentation">
                    <use href="assets/icons/hermes-symbols.svg#ng__hermes-logo-small"></use>
                  </svg>
                  <!-- Logo Desktop (>= 1024px) : logo avec texte -->
                  <svg class="icon-hermes-logo" viewBox="0 0 466.27333 267.15055" width="100%" height="100%" role="presentation">
                    <use href="assets/icons/hermes-symbols.svg#ng__hermes-logo"></use>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Droite : Actions (Audio en direct & Lien À Propos) -->
            <div class="header-bar-icons header-bar-right">
              @if (audioService.currentCarre(); as activeCarre) {
                <div
                  class="audio-pill-indicator"
                  [class.is-playing]="audioService.isPlaying()"
                  [class.is-paused]="!audioService.isPlaying()"
                  [class.is-collapsed]="!isMobileAudioExpanded()"
                  [class.is-expanded]="isMobileAudioExpanded()"
                  (click)="onPillClick()"
                  role="region"
                  aria-label="Lecteur audio en arrière-plan"
                >
                  <!-- Onde sonore animée Hermès (centrée dans le bouton rond quand replié) -->
                  <div
                    class="audio-pill-equalizer"
                    [class.is-playing]="audioService.isPlaying()"
                    [class.paused]="!audioService.isPlaying()"
                    aria-hidden="true"
                    title="Onde sonore"
                  >
                    <span class="eq-bar bar-1"></span>
                    <span class="eq-bar bar-2"></span>
                    <span class="eq-bar bar-3"></span>
                    <span class="eq-bar bar-4"></span>
                  </div>

                  <!-- Contenu de la pill dans le header (déployé en ligne) -->
                  <div class="audio-pill-body">
                    <!-- Groupe des 3 contrôles côte à côte : Lecture/Pause, Mute, Arrêt -->
                    <div class="audio-pill-controls">
                      <!-- 1. Bouton Lecture / Pause -->
                      <button
                        type="button"
                        class="audio-pill-toggle-btn audio-pill-ctrl-btn"
                        (click)="$event.stopPropagation(); audioService.togglePlay()"
                        [attr.aria-label]="audioService.isPlaying() ? 'Mettre en pause' : 'Reprendre la lecture'"
                        [title]="audioService.isPlaying() ? 'Mettre en pause' : 'Reprendre la lecture'"
                      >
                        @if (audioService.isPlaying()) {
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">
                            <line x1="4.5" y1="2.5" x2="4.5" y2="11.5"></line>
                            <line x1="9.5" y1="2.5" x2="9.5" y2="11.5"></line>
                          </svg>
                        } @else {
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" class="play-icon" aria-hidden="true">
                            <path d="M3.5 11.67V2.33L10.5 7L3.5 11.67Z"></path>
                          </svg>
                        }
                      </button>

                      <!-- 2. Bouton Mute -->
                      <button
                        type="button"
                        class="audio-pill-mute-btn audio-pill-ctrl-btn"
                        [class.is-muted]="audioService.isMuted()"
                        (click)="$event.stopPropagation(); audioService.toggleMute()"
                        [attr.aria-label]="audioService.isMuted() ? 'Rétablir le son' : 'Couper le son'"
                        [title]="audioService.isMuted() ? 'Rétablir le son' : 'Couper le son'"
                      >
                        @if (audioService.isMuted()) {
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M2.5 4.5H1.2C0.8 4.5 0.5 4.8 0.5 5.2V8.8C0.5 9.2 0.8 9.5 1.2 9.5H2.5L5 11.8C5.5 12.2 6.3 11.8 6.3 11.1V2.9C6.3 2.2 5.5 1.8 5 2.2L2.5 4.5Z"></path>
                            <line x1="8.5" y1="5" x2="12" y2="9"></line>
                            <line x1="12" y1="5" x2="8.5" y2="9"></line>
                          </svg>
                        } @else {
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M2.5 4.5H1.2C0.8 4.5 0.5 4.8 0.5 5.2V8.8C0.5 9.2 0.8 9.5 1.2 9.5H2.5L5 11.8C5.5 12.2 6.3 11.8 6.3 11.1V2.9C6.3 2.2 5.5 1.8 5 2.2L2.5 4.5Z"></path>
                            <path d="M8.5 4.5C9.2 5.2 9.5 6.1 9.5 7C9.5 7.9 9.2 8.8 8.5 9.5"></path>
                            <path d="M10.5 3C11.5 4.1 12 5.5 12 7C12 8.5 11.5 9.9 10.5 11"></path>
                          </svg>
                        }
                      </button>

                      <!-- 3. Bouton Arrêt (carré stop remplaçant la croix) -->
                      <button
                        type="button"
                        class="audio-pill-stop-btn audio-pill-close-btn audio-pill-ctrl-btn"
                        (click)="$event.stopPropagation(); closePlayerAndCollapse()"
                        title="Arrêter la lecture"
                        aria-label="Arrêter la lecture"
                      >
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
                          <rect x="3" y="3" width="8" height="8"></rect>
                        </svg>
                      </button>
                    </div>

                    <!-- Séparateur vertical -->
                    <span class="audio-pill-divider" aria-hidden="true"></span>

                    <!-- Métadonnées de l'œuvre (Titre cliquable & Horodatage) -->
                    <div class="audio-pill-track-info">
                      <a
                        [routerLink]="['/carre', activeCarre.slug]"
                        (click)="closeMobileAudio()"
                        class="audio-title-link"
                        [title]="'Aller au carré ' + activeCarre.title"
                      >
                        <span class="audio-title">{{ activeCarre.title }}</span>
                      </a>

                      <div class="audio-pill-timers">
                        <span class="audio-time">{{ audioService.formattedCurrentTime() }}</span>
                        <span class="audio-time-sep" aria-hidden="true">/</span>
                        <span class="audio-time-total">{{ audioService.formattedDuration() }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Backdrop transparent mobile pour refermer si clic en dehors -->
                @if (isMobileAudioExpanded()) {
                  <div
                    class="mobile-audio-backdrop"
                    (click)="closeMobileAudio()"
                    aria-hidden="true"
                  ></div>
                }
              }
            </div>
          </div>
        </div>

        <!-- Desktop Menu Bar (Masquée sur Mobile, active >= 1024px) -->
        <div class="header-menu-bar">
          <nav role="navigation" aria-label="Menu de navigation">
            <ul class="menu-bar-container">
              <!-- 1. FEMME (avec sous-menu au survol ISO Hermès) -->
              <li class="item">
                <div
                  class="parent-category"
                  (mouseleave)="scheduleCloseSubMenu(); onButtonMouseLeave()"
                >
                  <button
                    type="button"
                    id="collection-button"
                    class="category-link label-menu-nav"
                    [class.active]="isSubMenuOpen()"
                    (click)="toggleSubMenu()"
                    (mouseenter)="openSubMenu(); onButtonMouseEnter()"
                    aria-haspopup="true"
                    [attr.aria-expanded]="isSubMenuOpen()"
                    aria-controls="sub-menu-femme"
                  >
                    <span>Femme</span>
                  </button>

                  <div
                    id="sub-menu-femme"
                    class="sub-menu"
                    [class.show]="isSubMenuOpen()"
                    (mouseenter)="cancelCloseSubMenu(); onButtonMouseEnter()"
                    role="region"
                    aria-label="Sous-menu Femme"
                  >
                    <div
                      class="sub-menu-wrapper"
                      [style.paddingLeft.px]="femmeOffsetLeft() > 0 ? femmeOffsetLeft() : null"
                    >
                      <div class="sub-menu-content">
                        <ul class="sub-category-list">
                          <li class="sub-category-block">
                            <span class="sub-category-item label-menu-nav">Carrés</span>
                            <ul class="sub-category-links-list">
                              <li class="sub-subcategory-link paragraph-small">
                                <a
                                  routerLink="/"
                                  class="menu-link-lvl3"
                                  (click)="closeSubMenu()"
                                  title="Carrés de soie"
                                >
                                  Carrés de soie
                                </a>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <!-- 2. Texte de l'exposition -->
              <li class="item">
                <a
                  routerLink="/texte-oeuvre"
                  class="category-link label-menu-nav"
                  (mouseenter)="onButtonMouseEnter()"
                  (mouseleave)="onButtonMouseLeave()"
                >
                  <span>{{ artworkTextService.menuLabel() }}</span>
                </a>
              </li>

              <!-- 3. À Propos (en dernière position) -->
              <li class="item">
                <a
                  routerLink="/a-propos"
                  class="category-link label-menu-nav"
                  (mouseenter)="onButtonMouseEnter()"
                  (mouseleave)="onButtonMouseLeave()"
                >
                  <span>À Propos</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Mobile Navigation Drawer / Tray (Uniquement Mobile, Plein Écran ISO Hermès) -->
      <div
        class="tray-container"
        [class.open]="isMenuOpen()"
        [class.hidden]="!isMenuOpen() && !isDrawerVisible()"
      >
        <!-- Tiroir plein écran -->
        <div
          class="tray-wrapper tray-wrapper-fullscreen"
          [class.open]="isMenuOpen()"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation mobile"
        >
          <div class="tray-slide">
            <!-- Header du tiroir avec Logo Hermès à gauche et bouton fermeture à droite -->
            <div class="tray-header">
              <a routerLink="/" (click)="closeMenu()" class="tray-logo-link" aria-label="Hermes Alger — Accueil">
                <svg class="tray-logo-svg" viewBox="0 0 466.27333 267.15055" fill="#000" role="presentation" aria-hidden="true">
                  <use href="assets/icons/hermes-symbols.svg#ng__hermes-logo"></use>
                </svg>
              </a>

              <button
                type="button"
                class="button button-icon button-not-black tray-close-btn"
                (click)="closeMenu()"
                aria-label="Fermer le menu"
              >
                <app-svg-icon name="ng__cross" size="14px" stroke="#000"></app-svg-icon>
              </button>
            </div>

            <!-- Liens de navigation mobile -->
            <nav class="tray-nav" aria-label="Liens de navigation">
              <ul class="tray-nav-list">
                <!-- 1. FEMME accordéon multi-niveaux ISO Hermès -->
                <li class="tray-nav-item tray-nav-item-collapsible" [class.is-expanded]="isMobileFemmeExpanded()">
                  <button
                    type="button"
                    class="tray-link tray-link-accordion"
                    (click)="toggleMobileFemme()"
                    [attr.aria-expanded]="isMobileFemmeExpanded()"
                  >
                    <span class="femme-label" [class.is-grown]="isMobileFemmeExpanded()">Femme</span>
                    <span class="icon-plus-wrapper" [class.is-rotated]="isMobileFemmeExpanded()">
                      <app-svg-icon name="ng__plus" size="14px" stroke="#000"></app-svg-icon>
                    </span>
                  </button>

                  <!-- Accordéon niveau 2 : CARRÉS -->
                  <div class="tray-accordion-subcontent" [class.open]="isMobileFemmeExpanded()">
                    <div class="tray-accordion-subinner">
                      <!-- Ligne noire séparatrice avec transition grandissant de gauche à droite -->
                      <div class="femme-divider" [class.show]="isMobileFemmeExpanded()" aria-hidden="true"></div>

                      <!-- Bouton sous-catégorie CARRÉS -->
                      <button
                        type="button"
                        class="tray-subcat-btn"
                        (click)="toggleMobileCarres()"
                        [attr.aria-expanded]="isMobileCarresExpanded()"
                      >
                        <span class="carres-label">Carrés</span>
                        <span class="icon-plus-wrapper sub-plus" [class.is-rotated]="isMobileCarresExpanded()">
                          <app-svg-icon name="ng__plus" size="12px" stroke="#000"></app-svg-icon>
                        </span>
                      </button>

                      <!-- Accordéon niveau 3 : Carrés de soie -->
                      <div class="tray-accordion-lvl3content" [class.open]="isMobileCarresExpanded()">
                        <div class="tray-accordion-lvl3inner">
                          <ul class="tray-subnav-list">
                            <li class="tray-subnav-item">
                              <a
                                routerLink="/"
                                (click)="closeMenu()"
                                class="tray-sublink-lvl3"
                              >
                                Carrés de soie
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <!-- 2. Texte de l'exposition -->
                <li class="tray-nav-item">
                  <a
                    routerLink="/texte-oeuvre"
                    (click)="closeMenu()"
                    class="tray-link"
                  >
                    <span>{{ artworkTextService.menuLabel() }}</span>
                  </a>
                </li>

                <!-- 3. À Propos (en dernier) -->
                <li class="tray-nav-item">
                  <a
                    routerLink="/a-propos"
                    (click)="closeMenu()"
                    class="tray-link"
                  >
                    <span>À Propos</span>
                  </a>
                </li>
              </ul>

              @if (audioService.currentCarre(); as carre) {
                <div class="tray-audio-player" role="region" aria-label="Lecteur audio de l'interview">
                  <!-- Ligne Titre avec LED d'activité intégrée -->
                  <div class="tray-audio-title-row">
                    <span
                      class="tray-status-dot"
                      [class.is-playing]="audioService.isPlaying()"
                      [attr.aria-label]="audioService.isPlaying() ? 'Lecture en cours' : 'En pause'"
                    ></span>
                    <a
                      [routerLink]="['/carre', carre.slug]"
                      (click)="closeMenu()"
                      class="tray-audio-title"
                      [title]="'Voir le carré ' + carre.title"
                    >
                      {{ carre.title }}
                    </a>
                  </div>

                  <!-- Horodatage courant / durée totale -->
                  <div class="tray-audio-times">
                    <span class="time-current">{{ audioService.formattedCurrentTime() }}</span>
                    <span class="time-separator" aria-hidden="true">/</span>
                    <span class="time-total">{{ audioService.formattedDuration() }}</span>
                  </div>

                  <!-- Contrôles : Stop, Lecture / Pause, Mute (Option B) -->
                  <div class="tray-audio-controls" role="group" aria-label="Contrôles de lecture">
                    <!-- 1. Bouton Stop (retire l'audio du player) -->
                    <button
                      type="button"
                      class="tray-ctrl-btn stop-btn"
                      (click)="audioService.closePlayer()"
                      title="Arrêter la lecture"
                      aria-label="Arrêter la lecture"
                    >
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
                        <rect x="3" y="3" width="8" height="8"></rect>
                      </svg>
                      <span class="ctrl-label">Stop</span>
                    </button>

                    <!-- 2. Bouton Lecture / Pause (Bascule principale) -->
                    <button
                      type="button"
                      class="tray-ctrl-btn play-pause-btn"
                      [class.is-playing]="audioService.isPlaying()"
                      (click)="audioService.togglePlay()"
                      [attr.aria-label]="audioService.isPlaying() ? 'Mettre en pause' : 'Lancer la lecture'"
                      [title]="audioService.isPlaying() ? 'Mettre en pause' : 'Lancer la lecture'"
                    >
                      @if (audioService.isPlaying()) {
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">
                          <line x1="4.5" y1="2.5" x2="4.5" y2="11.5"></line>
                          <line x1="9.5" y1="2.5" x2="9.5" y2="11.5"></line>
                        </svg>
                        <span class="ctrl-label">Pause</span>
                      } @else {
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" class="play-icon-offset" aria-hidden="true">
                          <path d="M3.5 11.67V2.33L10.5 7L3.5 11.67Z"></path>
                        </svg>
                        <span class="ctrl-label">Lecture</span>
                      }
                    </button>

                    <!-- 3. Bouton Mute -->
                    <button
                      type="button"
                      class="tray-ctrl-btn mute-btn"
                      [class.is-muted]="audioService.isMuted()"
                      (click)="audioService.toggleMute()"
                      [title]="audioService.isMuted() ? 'Rétablir le son' : 'Couper le son'"
                      [attr.aria-label]="audioService.isMuted() ? 'Rétablir le son' : 'Couper le son'"
                    >
                      @if (audioService.isMuted()) {
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M2.5 4.5H1.2C0.8 4.5 0.5 4.8 0.5 5.2V8.8C0.5 9.2 0.8 9.5 1.2 9.5H2.5L5 11.8C5.5 12.2 6.3 11.8 6.3 11.1V2.9C6.3 2.2 5.5 1.8 5 2.2L2.5 4.5Z"></path>
                          <line x1="8.5" y1="5" x2="12" y2="9"></line>
                          <line x1="12" y1="5" x2="8.5" y2="9"></line>
                        </svg>
                        <span class="ctrl-label">Muet</span>
                      } @else {
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M2.5 4.5H1.2C0.8 4.5 0.5 4.8 0.5 5.2V8.8C0.5 9.2 0.8 9.5 1.2 9.5H2.5L5 11.8C5.5 12.2 6.3 11.8 6.3 11.1V2.9C6.3 2.2 5.5 1.8 5 2.2L2.5 4.5Z"></path>
                          <path d="M8.5 4.5C9.2 5.2 9.5 6.1 9.5 7C9.5 7.9 9.2 8.8 8.5 9.5"></path>
                          <path d="M10.5 3C11.5 4.1 12 5.5 12 7C12 8.5 11.5 9.9 10.5 11"></path>
                        </svg>
                        <span class="ctrl-label">Son</span>
                      }
                    </button>
                  </div>
                </div>
              }
            </nav>
          </div>
        </div>
      </div>
    </header>
  `,
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
    readonly audioService = inject(AudioPlayerService);
    readonly artworkTextService = inject(ArtworkTextService);
    readonly router = inject(Router);
    private readonly ngZone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);

    readonly isMenuOpen = signal<boolean>(false);
    readonly isDrawerVisible = signal<boolean>(false);
    readonly isScrolled = signal<boolean>(false);
    readonly isMobileAudioExpanded = signal<boolean>(false);

    // Signaux pour le survol des boutons et le sous-menu ISO Hermès
    readonly isButtonHovered = signal<boolean>(false);
    readonly isSubMenuOpen = signal<boolean>(false);
    readonly isMobileFemmeExpanded = signal<boolean>(false);
    readonly isMobileCarresExpanded = signal<boolean>(false);
    readonly currentUrl = signal<string>(typeof window !== 'undefined' ? window.location.pathname : '/');
    readonly femmeOffsetLeft = signal<number>(0);

    private subMenuCloseTimeout: any = null;
    private buttonHoverTimeout: any = null;

    readonly isHeaderWhite = computed(() => {
        const url = this.currentUrl();
        const isArtworkTextRoute = url === '/texte-oeuvre' || url === '/texte' || url.startsWith('/texte-oeuvre') || url.startsWith('/texte');
        return this.isButtonHovered() || this.isSubMenuOpen() || isArtworkTextRoute;
    });

    readonly isCarresActive = computed(() => {
        const url = this.currentUrl();
        return url === '/' || url.startsWith('/carre');
    });

    constructor() {
        // Écoute des changements de route pour actualiser l'état actif
        const routerSub = this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event) => {
                this.currentUrl.set(event.urlAfterRedirects || event.url);
            });

        this.destroyRef.onDestroy(() => {
            routerSub.unsubscribe();
            if (this.subMenuCloseTimeout) {
                clearTimeout(this.subMenuCloseTimeout);
            }
            if (this.buttonHoverTimeout) {
                clearTimeout(this.buttonHoverTimeout);
            }
        });

        if (typeof window !== 'undefined') {
            this.ngZone.runOutsideAngular(() => {
                let ticking = false;
                // Seuil Hermès ISO : dépassement de la barre logo desktop (64px)
                const scrollThreshold = 64;

                const onScroll = () => {
                    if (!ticking) {
                        window.requestAnimationFrame(() => {
                            const scrolled = window.scrollY > scrollThreshold;
                            if (this.isScrolled() !== scrolled) {
                                this.ngZone.run(() => {
                                    this.isScrolled.set(scrolled);
                                });
                            }
                            ticking = false;
                        });
                        ticking = true;
                    }
                };

                const onResize = () => {
                    if (this.isSubMenuOpen()) {
                        this.ngZone.run(() => {
                            this.updateFemmeOffset();
                        });
                    }
                };

                // Évaluation initiale
                onScroll();

                window.addEventListener('scroll', onScroll, { passive: true });
                window.addEventListener('resize', onResize, { passive: true });
                this.destroyRef.onDestroy(() => {
                    window.removeEventListener('scroll', onScroll);
                    window.removeEventListener('resize', onResize);
                });
            });
        }
    }

    updateFemmeOffset(): void {
        if (typeof document !== 'undefined') {
            const btn = document.getElementById('collection-button');
            if (btn) {
                const rect = btn.getBoundingClientRect();
                // Le texte dans button.category-link a un padding de 18px : aligne pile sous "Femme"
                this.femmeOffsetLeft.set(Math.round(rect.left + 18));
            }
        }
    }

    onButtonMouseEnter(): void {
        if (this.buttonHoverTimeout) {
            clearTimeout(this.buttonHoverTimeout);
            this.buttonHoverTimeout = null;
        }
        this.isButtonHovered.set(true);
    }

    onButtonMouseLeave(): void {
        if (this.buttonHoverTimeout) {
            clearTimeout(this.buttonHoverTimeout);
        }
        this.buttonHoverTimeout = setTimeout(() => {
            this.isButtonHovered.set(false);
        }, 100);
    }

    openSubMenu(): void {
        if (this.subMenuCloseTimeout) {
            clearTimeout(this.subMenuCloseTimeout);
            this.subMenuCloseTimeout = null;
        }
        this.updateFemmeOffset();
        this.isSubMenuOpen.set(true);
    }

    scheduleCloseSubMenu(): void {
        if (this.subMenuCloseTimeout) {
            clearTimeout(this.subMenuCloseTimeout);
        }
        this.subMenuCloseTimeout = setTimeout(() => {
            this.isSubMenuOpen.set(false);
        }, 120);
    }

    cancelCloseSubMenu(): void {
        if (this.subMenuCloseTimeout) {
            clearTimeout(this.subMenuCloseTimeout);
            this.subMenuCloseTimeout = null;
        }
    }

    closeSubMenu(): void {
        if (this.subMenuCloseTimeout) {
            clearTimeout(this.subMenuCloseTimeout);
            this.subMenuCloseTimeout = null;
        }
        this.isSubMenuOpen.set(false);
    }

    toggleSubMenu(): void {
        this.updateFemmeOffset();
        this.isSubMenuOpen.update(v => !v);
    }

    toggleMobileFemme(): void {
        this.isMobileFemmeExpanded.update(v => !v);
    }

    toggleMobileCarres(): void {
        this.isMobileCarresExpanded.update(v => !v);
    }

    onPillClick(): void {
        if (!this.isMobileAudioExpanded()) {
            this.isMobileAudioExpanded.set(true);
        }
    }

    toggleMobileAudio(): void {
        this.isMobileAudioExpanded.update(v => !v);
    }

    closeMobileAudio(): void {
        this.isMobileAudioExpanded.set(false);
    }

    closePlayerAndCollapse(): void {
        this.isMobileAudioExpanded.set(false);
        this.audioService.closePlayer();
    }

    openMenu(): void {
        this.closeMobileAudio();
        this.isDrawerVisible.set(true);
        // Délai micro-tick pour déclencher la transition CSS d'ouverture
        setTimeout(() => {
            this.isMenuOpen.set(true);
            if (typeof document !== 'undefined') {
                document.body.style.overflow = 'hidden';
            }
        }, 10);
    }

    closeMenu(): void {
        this.isMenuOpen.set(false);
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
        // Laisser le temps à l'animation de translation/fade (350ms) de se terminer
        setTimeout(() => {
            this.isDrawerVisible.set(false);
        }, 350);
    }
}

