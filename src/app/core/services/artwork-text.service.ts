import { computed, Injectable, signal } from '@angular/core';
import { ArtworkText } from '../models/artwork-text.model';

@Injectable({
  providedIn: 'root'
})
export class ArtworkTextService {
  private readonly _data = signal<ArtworkText | null>(null);
  readonly data = this._data.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  /**
   * Titre dynamique utilisé pour le bouton dans le header.
   * Repli élégant sur "Texte de l'Œuvre" pendant le chargement ou en cas d'absence de titre.
   */
  readonly menuLabel = computed(() => {
    const title = this._data()?.title?.trim();
    return title ? title : "Texte de l'Œuvre";
  });

  constructor() {
    // Déclenche le préchargement transparent dès l'instanciation
    this.loadText();
  }

  /**
   * Charge le fichier JSON public/texte-oeuvre.json
   */
  async loadText(customUrl = '/texte-oeuvre.json', forceReload = false): Promise<ArtworkText | null> {
    if (this._data() && !forceReload) {
      return this._data();
    }

    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await fetch(customUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status} lors du chargement de ${customUrl}`);
      }

      const json = await response.json();
      if (!json || typeof json !== 'object') {
        throw new Error('Format JSON invalide');
      }

      const artworkText: ArtworkText = {
        artist: typeof json.artist === 'string' ? json.artist : '',
        title: typeof json.title === 'string' ? json.title : '',
        author: typeof json.author === 'string' ? json.author : '',
        paragraphs: Array.isArray(json.paragraphs) ? json.paragraphs : []
      };

      this._data.set(artworkText);
      return artworkText;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.warn('[ArtworkTextService] Échec du chargement du texte :', message);
      this._error.set(message);
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }
}

