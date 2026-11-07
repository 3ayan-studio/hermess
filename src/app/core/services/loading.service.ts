import { Injectable, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

export const MIN_LOADER_DURATION_MS = 650;
export const INITIAL_LOADER_DURATION_MS = 1500;
export const LOADER_FADE_DURATION_MS = 350;

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private readonly router = inject(Router);

    private readonly _isLoading = signal(true);
    readonly isLoading = this._isLoading.asReadonly();

    private readonly _isFadingOut = signal(false);
    readonly isFadingOut = this._isFadingOut.asReadonly();

    private startTime = Date.now();
    private currentPath = '';
    private isInitialLoad = true;
    private fadeTimer: ReturnType<typeof setTimeout> | null = null;
    private hideTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                if (event.id === 1) {
                    // Boot initial : loader initial de 1500ms
                    this.startInitialLoader();
                } else {
                    // Changement de page lors de la navigation
                    const prevPath = this.normalizePath(this.currentPath);
                    const targetPath = this.normalizePath(event.url);

                    if (prevPath !== targetPath) {
                        this.startLoader();
                    }
                }
            } else if (event instanceof NavigationEnd) {
                this.currentPath = this.normalizePath(event.urlAfterRedirects || event.url);
                if (this._isLoading()) {
                    const minDuration = this.isInitialLoad
                        ? INITIAL_LOADER_DURATION_MS
                        : MIN_LOADER_DURATION_MS;
                    this.finishLoader(minDuration);
                }
            } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
                if (this._isLoading()) {
                    const minDuration = this.isInitialLoad
                        ? INITIAL_LOADER_DURATION_MS
                        : MIN_LOADER_DURATION_MS;
                    this.finishLoader(minDuration);
                }
            }
        });
    }

    private normalizePath(url: string): string {
        if (!url) return '/';
        const pathOnly = url.split('?')[0].split('#')[0];
        const trimmed = pathOnly.replace(/\/+$/, '');
        return trimmed || '/';
    }

    /**
     * Active le loader pour le boot initial de l'application (1500ms).
     */
    private startInitialLoader(): void {
        this.clearTimers();
        this.startTime = Date.now();
        this.isInitialLoad = true;
        this._isFadingOut.set(false);
        this._isLoading.set(true);
    }

    /**
     * Déclenche l'affichage immédiat du loader lors d'une navigation.
     * Réinitialise les compteurs et annule les timers de fade-out éventuels.
     */
    startLoader(): void {
        this.clearTimers();
        this.startTime = Date.now();
        this.isInitialLoad = false;
        this._isFadingOut.set(false);
        this._isLoading.set(true);
    }

    /**
     * Arrête immédiatement le loader (notamment pour les tests ou annulation directe).
     */
    stopLoader(): void {
        this.clearTimers();
        this._isLoading.set(false);
        this._isFadingOut.set(false);
        this.isInitialLoad = false;
    }

    /**
     * Finalise le chargement avec un délai minimum garanti (1500ms au boot, 650ms en navigation).
     */
    private finishLoader(minDuration: number = MIN_LOADER_DURATION_MS): void {
        this.clearTimers();
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, minDuration - elapsed);

        this.fadeTimer = setTimeout(() => {
            this._isFadingOut.set(true);

            // Transition CSS fade-out (350ms)
            this.hideTimer = setTimeout(() => {
                this._isLoading.set(false);
                this._isFadingOut.set(false);
                this.isInitialLoad = false;
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
