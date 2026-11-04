import { Injectable } from '@angular/core';
import {
  SegmentedTranscript,
  TranscriptMetadata,
  TranscriptSpeakersList,
  TranscriptSpeakersMap
} from '../models/transcript.model';

@Injectable({
  providedIn: 'root'
})
export class TranscriptService {
  private readonly cache = new Map<string, SegmentedTranscript>();

  /**
   * Charge asynchronement le transcript segmenté d'un carré avec mise en cache mémoire.
   */
  async loadTranscript(slug: string, customUrl?: string): Promise<SegmentedTranscript | null> {
    const url = customUrl || `/carres/${slug}/segmented-transcript.json`;

    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`[TranscriptService] Impossible de charger le transcript depuis ${url} (HTTP ${response.status})`);
        return null;
      }
      const data: SegmentedTranscript = await response.json();
      if (!data || !Array.isArray(data.segments)) {
        console.warn(`[TranscriptService] Format de données invalide pour ${url}`);
        return null;
      }
      this.cache.set(url, data);
      return data;
    } catch (err) {
      console.warn(`[TranscriptService] Erreur lors du chargement de ${url} :`, err);
      return null;
    }
  }

  /**
   * Résout le nom lisible d'un locuteur à partir des métadonnées (supporte les formats dictionnaire et tableau).
   */
  resolveSpeakerName(speakerId: string, metadata?: TranscriptMetadata): string {
    if (!metadata || !metadata.speakers) {
      return speakerId;
    }

    const speakers = metadata.speakers;

    if (Array.isArray(speakers)) {
      const list = speakers as TranscriptSpeakersList;
      const found = list.find(s => s.id === speakerId);
      return found?.name || speakerId;
    }

    const map = speakers as TranscriptSpeakersMap;
    const item = map[speakerId];
    if (typeof item === 'string') {
      return item;
    }
    if (item && typeof item === 'object' && 'name' in item) {
      return item.name;
    }

    return speakerId;
  }

  /**
   * Résout le rôle du locuteur si disponible.
   */
  resolveSpeakerRole(speakerId: string, metadata?: TranscriptMetadata): string | undefined {
    if (!metadata || !metadata.speakers) return undefined;

    const speakers = metadata.speakers;
    if (Array.isArray(speakers)) {
      const found = (speakers as TranscriptSpeakersList).find(s => s.id === speakerId);
      return found?.role;
    }

    const item = (speakers as TranscriptSpeakersMap)[speakerId];
    if (item && typeof item === 'object' && 'role' in item) {
      return item.role;
    }

    return undefined;
  }

  /**
   * Efface le cache (utile pour les tests unitaires)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

