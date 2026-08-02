// Mind Profile Dashboard™ — final screen of the 2-minute assessment
// lead magnet. Purely presentational scoring/labeling logic: combines
// the three already-earned, honestly-measured scores (Reading Sprint's
// 0-100 reading score, Memory Challenge's efficiency %, Focus
// Challenge's attention stability %) into one equally-weighted Overall
// Mind Score, plus qualitative labels and a personalized breakdown
// sentence. Nothing here is fabricated — every number traces back to a
// real tally from an earlier screen.

export type ReadingSpeedLabel = 'Building Speed' | 'Above Average' | 'Fast Reader' | 'Elite Speed'

export function getReadingSpeedLabel(wpm: number): ReadingSpeedLabel {
  if (wpm >= 300) return 'Elite Speed'
  if (wpm >= 220) return 'Fast Reader'
  if (wpm >= 150) return 'Above Average'
  return 'Building Speed'
}

export type MindScoreLabel = 'Emerging Potential' | 'Developing Potential' | 'Strong Potential' | 'Elite Potential'

export function getMindScoreLabel(score: number): MindScoreLabel {
  if (score >= 85) return 'Elite Potential'
  if (score >= 70) return 'Strong Potential'
  if (score >= 50) return 'Developing Potential'
  return 'Emerging Potential'
}

// Equally weighted across all three already-measured signals — the same
// "no single test can inflate the overall number" principle used by
// every blended score earlier in this flow.
export function computeOverallMindScore(readingScore: number, memoryEfficiencyPercent: number, focusStabilityPercent: number): number {
  return Math.round((readingScore + memoryEfficiencyPercent + focusStabilityPercent) / 3)
}

type TraitKey = 'reading' | 'memory' | 'focus'

const TRAIT_LABEL: Record<TraitKey, string> = {
  reading: 'Reading Speed',
  memory: 'Memory Efficiency',
  focus: 'Focus Stability',
}

const TRAIT_GROWTH_TIP: Record<TraitKey, string> = {
  reading: 'a few minutes of daily chunk-reading practice',
  memory: 'short daily recall drills',
  focus: 'brief focused-attention reps',
}

export type TraitScores = { reading: number; memory: number; focus: number }

// Names the strongest and weakest of the three trait scores (each
// already on a comparable 0-100 scale) and builds one personalized,
// encouraging sentence — never generic filler, and never implying a
// weakness where all three are genuinely tied.
export function buildMindProfileBreakdown(fullName: string, traitScores: TraitScores, overallScore: number, overallLabel: string): string {
  const firstName = fullName.trim().split(/\s+/)[0] ?? fullName
  const entries: readonly [TraitKey, number][] = [
    ['reading', traitScores.reading],
    ['memory', traitScores.memory],
    ['focus', traitScores.focus],
  ]
  const strongest = entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best))
  const weakest = entries.reduce((worst, entry) => (entry[1] < worst[1] ? entry : worst))

  if (strongest[0] === weakest[0]) {
    return `${firstName}, your Reading, Memory, and Focus scores are impressively balanced — a well-rounded cognitive profile scoring ${overallScore}/100 (${overallLabel}).`
  }

  return `${firstName}, your standout strength is ${TRAIT_LABEL[strongest[0]]} — a genuine cognitive edge. Add ${TRAIT_GROWTH_TIP[weakest[0]]} and your ${TRAIT_LABEL[weakest[0]]} can catch up fast, pushing your Overall Mind Score of ${overallScore}/100 (${overallLabel}) even higher.`
}

// The 600 WPM Quantum Speed positioning — shown regardless of how high
// the user's own reading score is, on purpose. The assessment only ever
// measures baseline (untrained) speed, so there is always real room
// between "how fast you already read" and "how fast trained readers
// read" worth naming.
export const QUANTUM_SPEED_TARGET_WPM = 600

// How far along the 0–600 bar the user's own baseline sits, clamped at
// 100% for the rare case someone already reads at or above target pace.
export function computeQuantumGapFillPercent(currentWpm: number): number {
  if (currentWpm <= 0) return 0
  return Math.min(100, Math.round((currentWpm / QUANTUM_SPEED_TARGET_WPM) * 100))
}

// A personalized "Nx" framing of the gap between the user's own
// baseline and the 600 WPM target — e.g. 172 WPM → "3.5x". Falls back to
// a plain "even faster" phrase once someone is already at/near target
// pace, since a sub-1x multiplier would read as a downgrade rather than
// an aspiration.
export function computeQuantumSpeedMultiplierLabel(currentWpm: number): string {
  if (currentWpm <= 0) return `${QUANTUM_SPEED_TARGET_WPM}+`
  const multiplier = QUANTUM_SPEED_TARGET_WPM / currentWpm
  if (multiplier < 1.05) return 'even faster'
  return `${(Math.round(multiplier * 10) / 10).toFixed(1)}x`
}

// The copywriting block for the Quantum Speed callout — personalized
// with the user's own multiplier when there's real room to close, and a
// retention-focused message for the rare case someone already tests at
// or above 600 WPM (the product's differentiator there is sustained
// retention at speed, not raw pace).
export function buildQuantumSpeedCopy(currentWpm: number): string {
  if (currentWpm >= QUANTUM_SPEED_TARGET_WPM) {
    return `This assessment only measured your baseline reading speed — and you're already near Quantum pace. Our Quantum Speed Reading Program is engineered to make 600+ WPM your sustained norm, with complete retention, not just a short burst.`
  }
  const multiplierLabel = computeQuantumSpeedMultiplierLabel(currentWpm)
  return `This assessment only measured your baseline reading speed — the speed your brain defaults to without training. Our Quantum Speed Reading Program is engineered to unlock 3-5x faster reading, up to 600+ WPM, with complete retention — not skimming. At your current pace, that's up to ${multiplierLabel} more words absorbed every minute.`
}
