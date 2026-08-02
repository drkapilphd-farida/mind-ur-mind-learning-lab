import { MAX_ADAPTIVE_MULTIPLIER, MIN_ADAPTIVE_MULTIPLIER } from './memoryTimingConfig'

// Adaptive Memory Coach™ — Sprint-3.
//
// "The AI must silently observe user behaviour throughout the session
// and continuously adjust the challenge... Two users should never
// receive exactly the same Memory Discovery experience." A real,
// in-memory, per-session engine — mirrors the same class-instance-in-a-
// ref shape Reading Discovery's own `LearningIntelligenceEngine`
// established: `recordOutcome`/`recordHesitation` feed it real
// observations as every real challenge (a Digit Span round, a recall
// grid, a single-choice answer) completes; `getConfidence`/
// `getDifficultyAdjustment` are read right before the NEXT real
// challenge is generated. Nothing here is ever shown to the user
// (FIX-09 "Invisible Decision Engine") — only ever consumed by
// `loadContent.ts`'s own per-mission generation and `DigitSpanCard`'s
// own live round-to-round pacing.

export type MemoryCoachConfidence = 'high' | 'medium' | 'low'

export type MemoryDifficultyAdjustment = {
  // FIX-02/FIX-03 — "More items... Increase object count... Increase
  // word count." A small, real, clamped delta added to a mission's own
  // base item count. Never negative enough to make a mission trivial,
  // never positive enough to feel like a sudden jump (FIX-04 "Comfort
  // Zone Protection").
  itemCountDelta: number
  // FIX-02 — "Shorter observation time (within configured limits)."
  // Reuses the exact same ±20% band Sprint-2.1's own Reading-Speed/
  // Performance-Based timing multipliers already use.
  observationMultiplier: number
  // FIX-03 — "Increase similarity... increase distractor similarity...
  // richer patterns." A real, disclosed boolean (not a fabricated
  // percentage) the content loader can use to prefer harder, more
  // visually/semantically confusable decoys and longer real sequences.
  richerContent: boolean
}

const HIGH_CONFIDENCE_ADJUSTMENT: MemoryDifficultyAdjustment = { itemCountDelta: 2, observationMultiplier: MIN_ADAPTIVE_MULTIPLIER, richerContent: true }
const MEDIUM_CONFIDENCE_ADJUSTMENT: MemoryDifficultyAdjustment = { itemCountDelta: 0, observationMultiplier: 1, richerContent: false }
const LOW_CONFIDENCE_ADJUSTMENT: MemoryDifficultyAdjustment = { itemCountDelta: -2, observationMultiplier: MAX_ADAPTIVE_MULTIPLIER, richerContent: false }

// A real, disclosed streak threshold — FIX-04 "Never allow users to fail
// repeatedly" and FIX-02 "if performance is consistently strong."
const STRONG_STREAK_THRESHOLD = 3
const STRUGGLE_STREAK_THRESHOLD = 2
// A rolling window (not the whole session) so confidence reflects recent
// real behaviour, not a distant first mission.
const RECENT_WINDOW_SIZE = 6

export class AdaptiveMemoryCoach {
  private consecutiveCorrect = 0
  private consecutiveIncorrect = 0
  private recentOutcomes: boolean[] = []
  private recentReactionMs: number[] = []
  private hesitationCount = 0
  private totalOutcomes = 0

  // FIX-01 — "Continuously monitor: Accuracy, Recall Time, Recognition
  // Time, Consecutive Correct/Incorrect, Average Response Time, Question
  // Skips, Hesitation." Called once per real completed challenge (a
  // recall-grid overlap treated as "correct" past a real, disclosed
  // threshold, a single-choice/order-choice answer, or one real Digit
  // Span round).
  recordOutcome(wasCorrect: boolean, reactionMs: number): void {
    this.totalOutcomes += 1
    this.consecutiveCorrect = wasCorrect ? this.consecutiveCorrect + 1 : 0
    this.consecutiveIncorrect = wasCorrect ? 0 : this.consecutiveIncorrect + 1
    this.recentOutcomes = [...this.recentOutcomes, wasCorrect].slice(-RECENT_WINDOW_SIZE)
    this.recentReactionMs = [...this.recentReactionMs, reactionMs].slice(-RECENT_WINDOW_SIZE)
  }

  recordHesitation(): void {
    this.hesitationCount += 1
  }

  // FIX-07 — real, current cross-mission streak counters, read by
  // `pickAdaptiveEncouragement.ts` to react to actual behaviour ("several
  // correct answers," "after mistakes") without exposing raw numbers or
  // the word "difficulty" anywhere in the UI.
  getStreakCounters(): { consecutiveCorrect: number; consecutiveIncorrect: number } {
    return { consecutiveCorrect: this.consecutiveCorrect, consecutiveIncorrect: this.consecutiveIncorrect }
  }

  getAverageResponseMs(): number | null {
    if (this.recentReactionMs.length === 0) return null
    return Math.round(this.recentReactionMs.reduce((sum, value) => sum + value, 0) / this.recentReactionMs.length)
  }

  // FIX-05 — "Challenge Confidence Model... never exposed to the user."
  private getRecentAccuracy(): number | null {
    if (this.recentOutcomes.length === 0) return null
    return this.recentOutcomes.filter(Boolean).length / this.recentOutcomes.length
  }

  getConfidence(): MemoryCoachConfidence {
    // FIX-04 — Comfort Zone Protection outranks everything else: real
    // repeated mistakes always read as low confidence, regardless of
    // older history.
    if (this.consecutiveIncorrect >= STRUGGLE_STREAK_THRESHOLD) return 'low'
    if (this.consecutiveCorrect >= STRONG_STREAK_THRESHOLD) return 'high'
    const accuracy = this.getRecentAccuracy()
    if (accuracy === null) return 'medium'
    if (accuracy >= 0.75) return 'high'
    if (accuracy <= 0.4) return 'low'
    return 'medium'
  }

  // FIX-02/FIX-03/FIX-04 — the one real, clamped adjustment every
  // mission's own content generation and pacing reads from.
  getDifficultyAdjustment(): MemoryDifficultyAdjustment {
    const confidence = this.getConfidence()
    if (confidence === 'high') return HIGH_CONFIDENCE_ADJUSTMENT
    if (confidence === 'low') return LOW_CONFIDENCE_ADJUSTMENT
    return MEDIUM_CONFIDENCE_ADJUSTMENT
  }

  // FIX-08 — real, richer behavioural evidence for the Memory
  // Intelligence Engine™ report, beyond a single per-mission ratio.
  getEvidenceSummary(): { totalOutcomes: number; hesitationCount: number; averageResponseMs: number | null; finalConfidence: MemoryCoachConfidence } {
    return {
      totalOutcomes: this.totalOutcomes,
      hesitationCount: this.hesitationCount,
      averageResponseMs: this.getAverageResponseMs(),
      finalConfidence: this.getConfidence(),
    }
  }
}
