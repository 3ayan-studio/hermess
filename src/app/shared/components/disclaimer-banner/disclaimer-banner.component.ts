import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

export const HERMESS_DISCLAIMER_KEY = 'hermess_disclaimer_dismissed';

@Component({
  selector: 'app-disclaimer-banner',
  standalone: true,
  template: `
    @if (!isDismissed()) {
      <aside
        class="disclaimer-banner"
        role="region"
        aria-label="Avertissement contenu sensible"
      >
        <div class="disclaimer-banner-container">
          <div class="disclaimer-banner-content">
            <svg
              class="warning-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
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
            <p class="disclaimer-text">
              <strong class="warning-bold">Contenu sensible :</strong>
              Ce site propose des échanges audio et leurs transcriptions, abordant des récits éprouvants susceptibles de heurter la sensibilité de certains visiteurs.
            </p>
          </div>

          <div class="disclaimer-actions">
            <button
              type="button"
              class="button button-color-primary button-radius-small button-variant-filled disclaimer-btn"
              (click)="dismiss()"
              aria-label="Accepter l'avertissement et fermer"
            >
              <span class="button-label">Compris</span>
            </button>
          </div>
        </div>
      </aside>
    }
  `,
  styleUrl: './disclaimer-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisclaimerBannerComponent {
  readonly isDismissed = signal<boolean>(true);

  constructor() {
    this.checkDismissedStatus();
  }

  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
      if (typeof localStorage !== 'undefined' && localStorage) {
        return localStorage;
      }
    } catch {
      return null;
    }
    return null;
  }

  private checkDismissedStatus(): void {
    const storage = this.getStorage();
    if (storage) {
      try {
        const val = storage.getItem(HERMESS_DISCLAIMER_KEY);
        this.isDismissed.set(val === 'true');
      } catch {
        this.isDismissed.set(false);
      }
    } else {
      this.isDismissed.set(false);
    }
  }

  dismiss(): void {
    this.isDismissed.set(true);
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(HERMESS_DISCLAIMER_KEY, 'true');
      } catch {
        // En cas d'erreur de quota ou navigation privée restrictive
      }
    }
  }
}
