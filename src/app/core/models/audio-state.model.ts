export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progressPercentage: number;
  isBuffering: boolean;
  carreId: string | null;
}
