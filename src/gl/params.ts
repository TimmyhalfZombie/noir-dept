// Adapted from Ink Bleed by Codemure (MIT License)
import type { Theme } from '../ui/theme';

/** Live-tunable look of the ink. Mutated by the demo panel (phase 5). */
export interface InkParams {
  /** Seconds for the spread (before the 150ms fade). */
  duration: number;
  /** Tendril reach multiplier, 0 = clean blob. */
  tendril: number;
  /** Noise frequency multiplier: lower = bigger, lazier shapes. */
  noiseScale: number;
  /** Frontier half-width in CSS px. */
  softness: number;
  /** Speed at which the shape evolves during the spread. */
  drift: number;
  /** Global playback rate (0.25 for slow motion). */
  timeScale: number;
}

export const inkParams: InkParams = {
  duration: 1.4,
  tendril: 1,
  noiseScale: 1,
  softness: 1.4,
  drift: 1,
  timeScale: 1,
};

/** Pigment colour pooled at the frontier, keyed by the theme being revealed. */
export const RIM_COLOR: Record<Theme, [number, number, number]> = {
  dark: [0.03, 0.03, 0.03], // ink: a touch denser than #0D0D0D
  light: [0.93, 0.93, 0.91], // bleach: a touch brighter than #E5E5E1
};
