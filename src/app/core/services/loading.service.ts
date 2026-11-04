import { Injectable, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

export const MIN_LOADER_DURATION_MS = 650;
export const LOADER_FADE_DURATION_MS = 350;

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private readonly router = inject(Router);

    private readonly _isLoading = signal(false);
    readonly isLoading = this._isLoading.asReadonly();

    private readonly _isFadingOut = signal(false);
    readonly isFadingOut = this._isFadingOut.asReadonly();

    private startTime = 0;
    private currentPath = '/';
    private fadeTimer: ReturnType<typeof setTimeout> | null = null;
    private hideTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                // Ignorer l'initialisation initiale de la page au premier boot (event.id === 1)
                if (event.id > 1) {
                    const prevPath = this.currentPath;
                    const targetPath = event.url.split('?')[0].split('#')[0];
                    const isFromHome = prevPath === '/' || prevPath === '';
                    const isToCarre = targetPath.startsWith('/carre');

                    if (isFromHome && isToCarre) {
                        this.startLoader();
                    }
                }
            } else if (event instanceof NavigationEnd) {
                this.currentPath = (event.urlAfterRedirects || event.url).split('?')[0].split('#')[0];
                if (this._isLoading()) {
                    this.finishLoader();
                }
            } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
                if (this._isLoading()) {
                    this.finishLoader();
                }
            }
        });
    }

    /**
     * Déclenche l'affichage immédiat du loader.
     * Peut être appelé explicitement au clic ou automatiquement par NavigationStart.
     */
    startLoader(): void {
        if (this._isLoading()) return;

        this.clearTimers();
        this.startTime = Date.now();
        this._isFadingOut.set(false);
        this._isLoading.set(true);
    }

    /**
     * Finalise le chargement avec un délai minimum garanti de 650ms.
     */
    private finishLoader(): void {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, MIN_LOADER_DURATION_MS - elapsed);

        this.fadeTimer = setTimeout(() => {
            this._isFadingOut.set(true);

            // Transition CSS fade-out (350ms)
            this.hideTimer = setTimeout(() => {
                this._isLoading.set(false);
                this._isFadingOut.set(false);
            }, LOADER_FADE_DURATION_MS);
        }, remaining);
    }

    private clearTimers(): void {
        if (this.fadeTimer) {
            clearTimeout(this.fadeTimer);
            this.fadeTimer = null;
        }
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }
}

