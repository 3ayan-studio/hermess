import { TranscriptSegment } from '../models/transcript.model';

/**
 * Recherche haute performance du segment actif pour des transcripts d'échange de 20 min à 2h
 * (1 500 à 2 500 segments) à 60 fps constants.
 *
 * Algorithme hybride :
 * 1. O(1) Fast-Path : Vérification du segment courant
 * 2. O(1) Sequential Step : Vérification du segment suivant immédiat (lecture continue)
 * 3. O(log N) Binary Search : Recherche dichotomique lors de sauts (seek, skip, navigation au clic)
 *
 * @param segments Liste triée par `start` ascendant
 * @param currentTime Temps actuel en secondes (float)
 * @param lastIndex Dernier index actif connu (-1 si initial ou inconnu)
 * @param keepActiveInGap Si vrai, conserve le segment précédent pendant un silence intermédiaire avant le prochain
 * @returns Index du segment actif, ou -1 si aucun
 */
export function findActiveSegmentIndex(
  segments: TranscriptSegment[],
  currentTime: number,
  lastIndex = -1,
  keepActiveInGap = true
): number {
  const n = segments.length;
  if (n === 0 || currentTime < 0) return -1;

  // Avant le tout premier segment
  if (currentTime < segments[0].start) {
    return -1;
  }

  // 1. Fast-path O(1) : On est toujours dans le même segment
  if (lastIndex >= 0 && lastIndex < n) {
    const cur = segments[lastIndex];
    if (currentTime >= cur.start && currentTime < cur.end) {
      return lastIndex;
    }

    // 2. Sequential Step O(1) : Progression naturelle vers le segment suivant
    const nextIndex = lastIndex + 1;
    if (nextIndex < n) {
      const next = segments[nextIndex];
      if (currentTime >= next.start && currentTime < next.end) {
        return nextIndex;
      }
      // Si on est dans le micro-silence entre lastIndex et nextIndex
      if (keepActiveInGap && currentTime >= cur.end && currentTime < next.start) {
        return lastIndex;
      }
    } else if (keepActiveInGap && currentTime >= cur.end) {
      // Fin du dernier segment
      return lastIndex;
    }
  }

  // 3. Binary Search O(log N) : Recherche dichotomique pour seeks et sauts temporels
  let low = 0;
  let high = n - 1;
  let candidateIndex = -1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const seg = segments[mid];

    if (currentTime >= seg.start && currentTime < seg.end) {
      return mid;
    }

    if (currentTime < seg.start) {
      high = mid - 1;
    } else {
      // currentTime >= seg.end
      candidateIndex = mid;
      low = mid + 1;
    }
  }

  // Si on est tombé dans un blanc entre candidateIndex et candidateIndex + 1
  if (keepActiveInGap && candidateIndex >= 0 && candidateIndex < n) {
    const nextIndex = candidateIndex + 1;
    if (nextIndex < n) {
      if (currentTime < segments[nextIndex].start) {
        return candidateIndex;
      }
    } else {
      return candidateIndex;
    }
  }

  return -1;
}

