import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ArtworkTextService } from '../../core/services/artwork-text.service';

@Component({
  selector: 'app-artwork-text',
  standalone: true,
  imports: [],
  template: `
    <main class="artwork-text-page" role="main">
      <article class="editorial-container" aria-labelledby="artwork-main-title">
        <!-- En-tête : Artiste (Gras), Titre (Gras Italique), Écrivain (Italique) -->
        <header class="artwork-text-header">
          @if (artworkService.isLoading() && !artworkService.data()) {
            <div class="loading-state" aria-live="polite">
              <span>Chargement du texte...</span>
            </div>
          } @else if (artworkService.data(); as text) {
            <!-- 1. Nom de l'artiste en gras -->
            <p class="artist-name" aria-label="Nom de l'artiste">{{ text.artist }}</p>

            <!-- 2. Titre du texte gras italique -->
            <h1 id="artwork-main-title" class="artwork-title">{{ text.title }}</h1>

            <!-- 3. Nom de l'écrivain -->
            <p class="author-name" aria-label="Nom de l'écrivain">par {{ text.author }}</p>
          } @else if (artworkService.error()) {
            <div class="error-state" role="alert">
              <p>Le texte de l'œuvre est momentanément indisponible.</p>
            </div>
          }
        </header>

        <!-- Paragraphes du texte (aéré, digeste, typographie littéraire) -->
        @if (artworkService.data(); as text) {
          <div class="artwork-text-body">
            @for (paragraph of text.paragraphs; track $index) {
              <p class="artwork-paragraph" [innerHTML]="paragraph"></p>
            }
          </div>

          <!-- Fin de lecture -->
          <footer class="artwork-text-footer">
            <div class="reading-end-mark" aria-hidden="true">— ♦ —</div>
          </footer>
        }
      </article>
    </main>
  `,
  styleUrl: './artwork-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtworkTextComponent {
  readonly artworkService = inject(ArtworkTextService);
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (this.document?.body) {
      this.document.body.classList.add('page-white-bg');
      this.destroyRef.onDestroy(() => {
        this.document?.body.classList.remove('page-white-bg');
      });
    }
  }
}

