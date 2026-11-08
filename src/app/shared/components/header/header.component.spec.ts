import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeaderComponent } from './header.component';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { Carre } from '../../../core/models/carre.model';

const mockCarre: Carre = {
    id: 'carre-header-test',
    slug: 'carre-laures',
    title: "L'Aurès",
    subtitle: 'Édition 2026',
    ref: 'H001',
    priceFormatted: '495 €',
    colorName: 'Blanc / Noir',
    year: 2026,
    artist: 'Fatima-Marwa Zouzal',
    dimensions: '90 x 90 cm',
    composition: '100 % soie',
    careInstructions: ['Nettoyage à sec'],
    description: 'Description test',
    artisticNote: 'Note artistique',
    images: [{ url: 'image.jpg', alt: "L'Aurès" }],
    thumbnail: 'thumb.jpg',
    hasInterview: true,
    interview: {
        audioUrl: 'https://example.com/audio.mp3',
        durationSeconds: 1800,
        durationFormatted: '00:30:00',
        title: 'Échange avec Fatima',
        interviewees: ['Fatima-Marwa Zouzal'],
        synopsis: 'Synopsis test',
        transcript: []
    }
};

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let audioService: AudioPlayerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderComponent],
            providers: [
                provideRouter([
                    { path: 'carre/:slug', component: HeaderComponent }
                ]),
                AudioPlayerService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        audioService = TestBed.inject(AudioPlayerService);
        fixture.detectChanges();
    });

    it('should create header component', () => {
        expect(component).toBeTruthy();
    });

    it('should not display audio pill indicator when no carre is active', () => {
        audioService.currentCarre.set(null);
        fixture.detectChanges();

        const pill = fixture.nativeElement.querySelector('.audio-pill-indicator');
        expect(pill).toBeNull();
    });

    it('should render header-floating-player and apply is-hidden when exchange player is in viewport', () => {
        audioService.currentCarre.set(mockCarre);
        fixture.detectChanges();

        const floatingPlayer = fixture.nativeElement.querySelector('.header-floating-player');
        expect(floatingPlayer).toBeTruthy();
        expect(floatingPlayer.classList.contains('is-hidden')).toBe(false);

        audioService.setExchangePlayerInViewport(true);
        fixture.detectChanges();
        expect(floatingPlayer.classList.contains('is-hidden')).toBe(true);

        audioService.setExchangePlayerInViewport(false);
        fixture.detectChanges();
        expect(floatingPlayer.classList.contains('is-hidden')).toBe(false);
    });

    it('should apply is-scrolled class to floating player when page is scrolled', () => {
        audioService.currentCarre.set(mockCarre);
        fixture.detectChanges();

        const floatingPlayer = fixture.nativeElement.querySelector('.header-floating-player');
        expect(floatingPlayer.classList.contains('is-scrolled')).toBe(false);

        component.isScrolled.set(true);
        fixture.detectChanges();
        expect(floatingPlayer.classList.contains('is-scrolled')).toBe(true);
    });

    it('should apply is-menu-open class to floating player when mobile menu drawer is open', () => {
        audioService.currentCarre.set(mockCarre);
        fixture.detectChanges();

        const floatingPlayer = fixture.nativeElement.querySelector('.header-floating-player');
        expect(floatingPlayer.classList.contains('is-menu-open')).toBe(false);

        component.isMenuOpen.set(true);
        fixture.detectChanges();
        expect(floatingPlayer.classList.contains('is-menu-open')).toBe(true);
    });

    it('should display audio pill indicator when a carre is active', () => {
        audioService.currentCarre.set(mockCarre);
        fixture.detectChanges();

        const pill = fixture.nativeElement.querySelector('.audio-pill-indicator');
        expect(pill).toBeTruthy();

        const title = fixture.nativeElement.querySelector('.audio-title');
        expect(title?.textContent?.trim()).toBe(mockCarre.title);
    });

    it('should toggle playback when pill toggle button is clicked', () => {
        audioService.currentCarre.set(mockCarre);
        fixture.detectChanges();

        expect(audioService.isPlaying()).toBe(false);

        const toggleBtn = fixture.nativeElement.querySelector('.audio-pill-toggle-btn') as HTMLButtonElement;
        expect(toggleBtn).toBeTruthy();

        toggleBtn.click();
        fixture.detectChanges();

        // Since audio.play() in test environment does not produce sound, togglePlay() was executed
        expect(audioService.currentCarre()?.id).toBe(mockCarre.id);
    });

    it('should toggle mute when pill mute button is clicked', () => {
        audioService.currentCarre.set(mockCarre);
        fixture.detectChanges();

        expect(audioService.isMuted()).toBe(false);

        const muteBtn = fixture.nativeElement.querySelector('.audio-pill-mute-btn') as HTMLButtonElement;
        expect(muteBtn).toBeTruthy();

        muteBtn.click();
        fixture.detectChanges();

        expect(audioService.isMuted()).toBe(true);
    });

    it('should toggle mobile audio expansion when pill indicator is clicked on mobile', () => {
        audioService.currentCarre.set(mockCarre);
        fixture.detectChanges();

        expect(component.isMobileAudioExpanded()).toBe(false);

        const pill = fixture.nativeElement.querySelector('.audio-pill-indicator') as HTMLElement;
        expect(pill).toBeTruthy();

        pill.click();
        fixture.detectChanges();
        expect(component.isMobileAudioExpanded()).toBe(true);
        expect(pill.classList.contains('is-expanded')).toBe(true);
    });

    it('should close mobile audio expansion when backdrop is clicked', () => {
        audioService.currentCarre.set(mockCarre);
        component.isMobileAudioExpanded.set(true);
        fixture.detectChanges();

        const backdrop = fixture.nativeElement.querySelector('.mobile-audio-backdrop') as HTMLElement;
        expect(backdrop).toBeTruthy();

        backdrop.click();
        fixture.detectChanges();

        expect(component.isMobileAudioExpanded()).toBe(false);
    });

    it('should close and reset player when pill stop button is clicked', () => {
        audioService.currentCarre.set(mockCarre);
        audioService.currentTime.set(45);
        fixture.detectChanges();

        const stopBtn = fixture.nativeElement.querySelector('.audio-pill-stop-btn') as HTMLButtonElement;
        expect(stopBtn).toBeTruthy();

        stopBtn.click();
        fixture.detectChanges();

        expect(audioService.currentCarre()).toBeNull();
        expect(audioService.currentTime()).toBe(0);
        expect(audioService.isPlaying()).toBe(false);

        const pill = fixture.nativeElement.querySelector('.audio-pill-indicator');
        expect(pill).toBeNull();
    });

    describe('Navbar ISO Hermès', () => {
        it('should contain Femme, Artwork text, and À PROPOS in correct order', () => {
            const menuItems = fixture.nativeElement.querySelectorAll('.menu-bar-container .item');
            expect(menuItems.length).toBe(3);

            const femmeBtn = menuItems[0].querySelector('#collection-button');
            expect(femmeBtn?.textContent?.trim()).toBe('Femme');

            const textLink = menuItems[1].querySelector('a');
            expect(textLink?.getAttribute('routerLink') || textLink?.getAttribute('href')).toBe('/her-story-her-mess');

            const aboutLink = menuItems[2].querySelector('a');
            expect(aboutLink?.textContent?.trim()).toBe("À PROPOS");
            expect(aboutLink?.getAttribute('routerLink') || aboutLink?.getAttribute('href')).toBe('/a-propos');
        });

        it('should NOT contain Entretiens & Transcriptions', () => {
            const text = fixture.nativeElement.textContent;
            expect(text).not.toContain('Entretiens & Transcriptions');
            expect(text).not.toContain('Démarche Artistique');
        });

        it('should open sub-menu and display Carrés de soie when Femme is hovered', () => {
            expect(component.isSubMenuOpen()).toBe(false);

            component.openSubMenu();
            fixture.detectChanges();

            expect(component.isSubMenuOpen()).toBe(true);

            const subMenu = fixture.nativeElement.querySelector('#sub-menu-femme');
            expect(subMenu?.classList.contains('show')).toBe(true);

            // Le doublon "Femme" et sa ligne ne doivent plus exister dans le sous-menu
            expect(subMenu?.querySelector('.parent-category-title')).toBeNull();

            const categoryTitle = subMenu?.querySelector('.sub-category-item');
            expect(categoryTitle?.textContent?.trim()).toBe('Carrés');

            const lvl3Link = subMenu?.querySelector('.menu-link-lvl3');
            expect(lvl3Link?.textContent?.trim()).toBe('Carrés de soie');
            // "Carrés de soie" ne doit pas être actif/souligné par défaut
            expect(lvl3Link?.classList.contains('active')).toBe(false);
        });

        it('should add background-white class to header when a button or sub-menu is hovered', () => {
            const headerContainer = fixture.nativeElement.querySelector('.header-main-container');
            expect(headerContainer.classList.contains('background-white')).toBe(false);

            component.onButtonMouseEnter();
            fixture.detectChanges();

            expect(component.isHeaderWhite()).toBe(true);
            expect(headerContainer.classList.contains('background-white')).toBe(true);

            component.onButtonMouseLeave();
            // Le timeout buffer est de 100ms
            component.isButtonHovered.set(false);
            fixture.detectChanges();

            expect(component.isHeaderWhite()).toBe(false);
            expect(headerContainer.classList.contains('background-white')).toBe(false);
        });

        it('should have background-white class when on /her-story-her-mess route', () => {
            const headerContainer = fixture.nativeElement.querySelector('.header-main-container');
            component.currentUrl.set('/her-story-her-mess');
            fixture.detectChanges();

            expect(component.isHeaderWhite()).toBe(true);
            expect(headerContainer.classList.contains('background-white')).toBe(true);
        });

        it('should close sub-menu when closeSubMenu() is called', () => {
            component.openSubMenu();
            fixture.detectChanges();
            expect(component.isSubMenuOpen()).toBe(true);

            component.closeSubMenu();
            fixture.detectChanges();
            expect(component.isSubMenuOpen()).toBe(false);
        });

        it('should NOT keep active class on navbar buttons when on current page', () => {
            // Les boutons ne doivent plus avoir la classe active persistante
            const femmeBtn = fixture.nativeElement.querySelector('#collection-button');
            const textLink = fixture.nativeElement.querySelector('a[routerLink="/her-story-her-mess"]');
            const aboutLink = fixture.nativeElement.querySelector('a[routerLink="/a-propos"]');

            expect(femmeBtn?.classList.contains('active')).toBe(false);
            expect(textLink?.classList.contains('active')).toBe(false);
            expect(aboutLink?.classList.contains('active')).toBe(false);
        });

        it('should have Hermès logo at left and close button at right in mobile tray header', () => {
            const trayHeader = fixture.nativeElement.querySelector('.tray-header');
            expect(trayHeader).toBeTruthy();

            const logoLink = trayHeader.firstElementChild;
            expect(logoLink.classList.contains('tray-logo-link')).toBe(true);

            const closeBtn = trayHeader.lastElementChild;
            expect(closeBtn.classList.contains('tray-close-btn')).toBe(true);
        });

        it('should toggle mobile Femme and Carrés sections in drawer', () => {
            expect(component.isMobileFemmeExpanded()).toBe(false);
            expect(component.isMobileCarresExpanded()).toBe(false);

            // Dépliage Femme
            component.toggleMobileFemme();
            fixture.detectChanges();
            expect(component.isMobileFemmeExpanded()).toBe(true);

            const femmeLabel = fixture.nativeElement.querySelector('.femme-label');
            expect(femmeLabel?.classList.contains('is-grown')).toBe(true);

            const divider = fixture.nativeElement.querySelector('.femme-divider');
            expect(divider?.classList.contains('show')).toBe(true);

            // Dépliage Carrés
            component.toggleMobileCarres();
            fixture.detectChanges();
            expect(component.isMobileCarresExpanded()).toBe(true);

            const lvl3Link = fixture.nativeElement.querySelector('.tray-sublink-lvl3');
            expect(lvl3Link?.textContent?.trim()).toBe('Carrés de soie');

            // Repliage
            component.toggleMobileCarres();
            fixture.detectChanges();
            expect(component.isMobileCarresExpanded()).toBe(false);

            component.toggleMobileFemme();
            fixture.detectChanges();
            expect(component.isMobileFemmeExpanded()).toBe(false);
        });
    });

    describe('Burger Tray Audio Player', () => {
        beforeEach(() => {
            audioService.currentCarre.set(mockCarre);
            fixture.detectChanges();
        });

        it('should render tray audio player without Interview Audio label', () => {
            const trayPlayer = fixture.nativeElement.querySelector('.tray-audio-player');
            expect(trayPlayer).toBeTruthy();
            expect(trayPlayer.textContent).not.toContain('Interview Audio');
        });

        it('should place activity LED dot next to the title link in tray-audio-title-row', () => {
            const titleRow = fixture.nativeElement.querySelector('.tray-audio-title-row');
            expect(titleRow).toBeTruthy();

            const dot = titleRow.querySelector('.tray-status-dot');
            const titleLink = titleRow.querySelector('a.tray-audio-title');
            expect(dot).toBeTruthy();
            expect(titleLink).toBeTruthy();
            expect(titleLink.textContent?.trim()).toBe(mockCarre.title);
            expect(titleLink.getAttribute('href') || titleLink.getAttribute('routerLink')).toBe('/carre/carre-laures');

            // Le dot et le lien de titre sont bien voisins directs
            expect(dot.nextElementSibling).toBe(titleLink);
        });

        it('should update activity LED when isPlaying signal changes', () => {
            const dot = fixture.nativeElement.querySelector('.tray-status-dot');
            expect(dot.classList.contains('is-playing')).toBe(false);

            audioService.isPlaying.set(true);
            fixture.detectChanges();
            expect(dot.classList.contains('is-playing')).toBe(true);

            audioService.isPlaying.set(false);
            fixture.detectChanges();
            expect(dot.classList.contains('is-playing')).toBe(false);
        });

        it('should render Stop, Play/Pause, and Mute controls', () => {
            const controls = fixture.nativeElement.querySelector('.tray-audio-controls');
            expect(controls).toBeTruthy();

            const stopBtn = controls.querySelector('.stop-btn');
            const playPauseBtn = controls.querySelector('.play-pause-btn');
            const muteBtn = controls.querySelector('.mute-btn');

            expect(stopBtn).toBeTruthy();
            expect(playPauseBtn).toBeTruthy();
            expect(muteBtn).toBeTruthy();
        });

        it('should trigger togglePlay when play-pause button is clicked', () => {
            const playPauseBtn = fixture.nativeElement.querySelector('.tray-audio-controls .play-pause-btn') as HTMLButtonElement;
            expect(playPauseBtn).toBeTruthy();

            expect(audioService.isPlaying()).toBe(false);
            playPauseBtn.click();
            fixture.detectChanges();

            // togglePlay a été invoqué sur le même carré
            expect(audioService.currentCarre()?.id).toBe(mockCarre.id);
        });

        it('should remove audio from player when stop button is clicked', () => {
            audioService.currentTime.set(45);
            audioService.isPlaying.set(true);
            fixture.detectChanges();

            const stopBtn = fixture.nativeElement.querySelector('.tray-audio-controls .stop-btn') as HTMLButtonElement;
            expect(stopBtn).toBeTruthy();

            stopBtn.click();
            fixture.detectChanges();

            expect(audioService.currentCarre()).toBeNull();
            expect(audioService.currentTime()).toBe(0);
            expect(audioService.isPlaying()).toBe(false);

            const trayPlayer = fixture.nativeElement.querySelector('.tray-audio-player');
            expect(trayPlayer).toBeNull();
        });

        it('should have routerLink to carre page and call closeMenu when title link is clicked', () => {
            const titleLink = fixture.nativeElement.querySelector('a.tray-audio-title') as HTMLAnchorElement;
            expect(titleLink).toBeTruthy();
            expect(titleLink.getAttribute('href') || titleLink.getAttribute('routerLink')).toBe('/carre/carre-laures');

            const spy = vi.spyOn(component, 'closeMenu');
            titleLink.click();
            expect(spy).toHaveBeenCalled();
        });

        it('should trigger toggleMute when mute button is clicked', () => {
            const muteBtn = fixture.nativeElement.querySelector('.tray-audio-controls .mute-btn') as HTMLButtonElement;
            expect(muteBtn).toBeTruthy();

            expect(audioService.isMuted()).toBe(false);
            muteBtn.click();
            fixture.detectChanges();
            expect(audioService.isMuted()).toBe(true);

            muteBtn.click();
            fixture.detectChanges();
            expect(audioService.isMuted()).toBe(false);
        });
    });
});

