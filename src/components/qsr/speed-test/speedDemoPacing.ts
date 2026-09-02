// Speed Demo Pacing™ — pure functions behind the "Experience It" stage's
// auto-accelerating flash: the demo should feel deliberately designed
// (single words first, phrases later, speed climbing throughout), not a
// flat flash at one chunk size. No DB/React, independently testable —
// same convention as pacingMath.ts.

export const RAMP_START_WPM = 220;
export const RAMP_CAP_WPM = 560;

// Chunk size grows in thirds of the passage — single words while the
// reader is still settling in, then 2-word, then 3-word phrases as the
// "level up" moment the demo is meant to demonstrate.
export function buildProgressiveChunks(words: readonly string[]): readonly string[] {
  const total = words.length;
  const chunks: string[] = [];
  let index = 0;
  while (index < total) {
    const fraction = index / total;
    const size = fraction < 1 / 3 ? 1 : fraction < 2 / 3 ? 2 : 3;
    chunks.push(words.slice(index, index + size).join(" "));
    index += size;
  }
  return chunks;
}

// Continuous linear ramp from RAMP_START_WPM to RAMP_CAP_WPM across the
// chunk sequence — replaces the old fixed-step-every-5-words jump so the
// live WPM readout climbs smoothly instead of visibly staircasing.
export function computeRampWpm(chunkIndex: number, totalChunks: number): number {
  if (totalChunks <= 1) return RAMP_START_WPM;
  const fraction = Math.min(Math.max(chunkIndex / (totalChunks - 1), 0), 1);
  return Math.round(RAMP_START_WPM + fraction * (RAMP_CAP_WPM - RAMP_START_WPM));
}
