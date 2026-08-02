// True WPM™ — Comprehension-Based WPM Penalty. Raw reading pace alone
// overstates ability if the reader didn't understand what they read: a
// fast skim with poor comprehension isn't "fast reading," it's skimming.
// This discounts the raw words-per-minute figure by how much of it was
// actually understood, so the WPM this app ever shows or persists is an
// honest, comprehension-adjusted rate — never an inflated pace number.
// This is the ONLY transformation ever applied to WPM; comprehension
// itself still shows separately everywhere in the UI (Metric
// Separation™ — WPM and comprehension% are always both visible, never
// silently merged into one hidden number the user can't unpack).
export function computeTrueWpm(rawWpm: number, comprehensionAccuracyPercent: number): number {
  return Math.round(rawWpm * (comprehensionAccuracyPercent / 100))
}
