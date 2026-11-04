import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  template: `
    @if (loadingService.isLoading()) {
      <div
        class="notification-overlay opaque"
        [class.is-fading-out]="loadingService.isFadingOut()"
        role="status"
        aria-live="polite"
        aria-label="Chargement de l'exposition"
      >
        <div class="loader">
          <img
            src="/loader.svg"
            alt="Hermès"
            class="image-loader"
            width="200"
            height="104"
            loading="eager"
            decoding="sync"
          />
        </div>
      </div>
    }
  `,
  styleUrl: './page-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLoaderComponent {
  readonly loadingService = inject(LoadingService);
}

