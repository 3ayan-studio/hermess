import { Injectable, computed, signal } from '@angular/core';
import { Carre } from '../models/carre.model';

export function formatTimeHHMMSS(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;

  // Signaux d'état
  readonly currentCarre = signal<Carre | null>(null);
  readonly isPlaying = signal<boolean>(false);
  readonly currentTime = signal<number>(0);
  readonly duration = signal<number>(0);
  readonly isBuffering = signal<boolean>(false);
  readonly isMuted = signal<boolean>(false);

  // Signaux calculés (computed)
  readonly progressPercentage = computed(() => {
    const dur = this.duration();
    if (dur <= 0) return 0;
    return Math.min(100, Math.max(0, (this.currentTime() / dur) * 100));
  });

  readonly formattedCurrentTime = computed(() => {
    return formatTimeHHMMSS(this.currentTime());
  });

  readonly formattedDuration = computed(() => {
    const dur = this.duration();
    if (dur > 0) {
      return formatTimeHHMMSS(dur);
    }
    const carre = this.currentCarre();
    return carre?.interview ? carre.interview.durationFormatted : '00:00:00';
  });

  constructor() {
    this.initAudioElement();
  }

  private initAudioElement(): void {
    if (typeof window === 'undefined') return;

    this.audio = new Audio();
    // Support natif du streaming HTTP Range 206 : ne précharge que les métadonnées
    this.audio.preload = 'metadata';

    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));
    this.audio.addEventListener('ended', () => {
      this.isPlaying.set(false);
      this.currentTime.set(0);
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime.set(this.audio.currentTime);
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio && !isNaN(this.audio.duration)) {
        this.duration.set(this.audio.duration);
      }
    });

    this.audio.addEventListener('durationchange', () => {
      if (this.audio && !isNaN(this.audio.duration)) {
        this.duration.set(this.audio.duration);
      }
    });

    this.audio.addEventListener('waiting', () => this.isBuffering.set(true));
    this.audio.addEventListener('playing', () => this.isBuffering.set(false));
    this.audio.addEventListener('canplay', () => this.isBuffering.set(false));
    this.audio.addEventListener('volumechange', () => {
      if (this.audio) {
        this.isMuted.set(this.audio.muted);
      }
    });
  }

  /**
   * Charge et joue l'interview associée au carré
   */
  playCarre(carre: Carre): void {
    if (!this.audio || !carre.interview) return;

    const current = this.currentCarre();
    if (current?.id === carre.id) {
      // Même carré : bascule Play / Pause
      this.togglePlay();
      return;
    }

    // Nouveau carré
    this.currentCarre.set(carre);
    this.audio.src = carre.interview.audioUrl;
    this.audio.load();
    this.duration.set(carre.interview.durationSeconds);
    this.currentTime.set(0);

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Lecture automatique bloquée par le navigateur :', err);
        this.isPlaying.set(false);
      });
    }
  }

  /**
   * Charge, positionne à un timestamp précis et lance la lecture
   */
  playFromTime(carre: Carre, timeInSeconds: number): void {
    if (!this.audio || !carre.interview) return;

    this.currentTime.set(timeInSeconds);

    const isDifferentCarre = this.currentCarre()?.id !== carre.id;

    if (isDifferentCarre) {
      this.currentCarre.set(carre);
      this.audio.src = carre.interview.audioUrl;
      this.audio.load();
      this.duration.set(carre.interview.durationSeconds);
    }

    // Déclencher la lecture immédiatement dans le stack du geste utilisateur
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Lecture automatique bloquée par le navigateur :', err);
        this.isPlaying.set(false);
      });
    }

    const applySeek = () => {
      if (!this.audio) return;
      this.seek(timeInSeconds);
    };

    if (this.audio.readyState >= 1) {
      applySeek();
    } else {
      this.audio.addEventListener('loadedmetadata', applySeek, { once: true });
      this.audio.addEventListener('canplay', applySeek, { once: true });
    }
  }

  togglePlay(): void {
    if (!this.audio || !this.currentCarre()) return;

    if (this.isPlaying()) {
      this.audio.pause();
    } else {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Erreur lecture audio :', err);
        });
      }
    }
  }

  seek(timeInSeconds: number): void {
    if (!this.audio) return;
    const dur = this.duration();
    const target = Math.max(0, Math.min(dur, timeInSeconds));
    this.audio.currentTime = target;
    this.currentTime.set(target);
  }

  /**
   * Alias de seek pour compatibilité avec l'API standard
   */
  seekTo(timeInSeconds: number): void {
    this.seek(timeInSeconds);
  }

  seekByPercentage(percentage: number): void {
    const dur = this.duration();
    if (dur <= 0) return;
    const clamped = Math.max(0, Math.min(100, percentage));
    const targetTime = (clamped / 100) * dur;
    this.seek(targetTime);
  }

  skip(deltaSeconds: number): void {
    if (!this.audio) return;
    this.seek(this.currentTime() + deltaSeconds);
  }

  toggleMute(): void {
    if (!this.audio) {
      this.isMuted.update(m => !m);
      return;
    }
    const nextState = !this.isMuted();
    this.audio.muted = nextState;
    this.isMuted.set(nextState);
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      try {
        this.audio.currentTime = 0;
      } catch {}
    }
    this.isPlaying.set(false);
    this.currentTime.set(0);
  }

  pause(): void {
    if (this.audio && this.isPlaying()) {
      try {
        this.audio.pause();
      } catch {}
    }
    this.isPlaying.set(false);
  }

  play(): void {
    if (!this.audio || !this.currentCarre()) return;
    if (!this.isPlaying()) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Erreur lecture audio :', err);
        });
      }
    }
  }

  closePlayer(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.isPlaying.set(false);
    this.currentTime.set(0);
    this.duration.set(0);
    this.currentCarre.set(null);
  }
}
