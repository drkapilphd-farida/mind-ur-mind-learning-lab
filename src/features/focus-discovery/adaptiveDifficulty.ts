// Adaptive Difficulty Engine™ — Sprint-1.8. "AI Adaptive Observation™...
// If the user performs exceptionally well, the next level becomes
// slightly harder. If performance declines sharply, difficulty should
// stabilize instead of increasing aggressively. Avoid sudden jumps."
//
// A real, small, reusable controller — the SAME instance one mission's
// own component holds in a ref across its real 5 rounds. It decouples
// two previously-conflated ideas: the real ROUND COUNTER (still always
// 0→4, still ends the mission after exactly 5 real rounds — the locked
// Progressive Difficulty Ladder™ from Sprint-1.7 is untouched) from the
// real EFFECTIVE DIFFICULTY LEVEL fed into that round's own content
// generator, which now only advances when the PREVIOUS real round's own
// real accuracy actually earned it.
//
// Deliberately binary, not three-tier: "exceptional" performance still
// only ever advances by the SAME real one step the fixed ladder already
// uses (LOCKED RULE — "never increase all variables together," so a
// real double-step would silently introduce two real dimensions at
// once). The real, felt difference for a strong performer is that they
// are never HELD BACK — every real round they earn, they get.

const STABILIZE_AT_OR_BELOW_ACCURACY = 0.5

export class AdaptiveDifficultyController {
  private effectiveLevel = 0
  private stabilizedCount = 0
  private readonly maxLevel: number

  constructor(maxLevel: number) {
    this.maxLevel = maxLevel
  }

  // The real effective difficulty level (0-indexed) the CURRENT round
  // should generate its own content at — never the round counter itself.
  get currentLevel(): number {
    return this.effectiveLevel
  }

  // How many real rounds this real session chose to stabilize rather
  // than advance — part of the real AI Learning Model™ signal set
  // (FIX-08-style: collected, never displayed).
  get stabilizedRounds(): number {
    return this.stabilizedCount
  }

  // Call once, right after a real round finishes, with that round's own
  // real accuracy ratio (0-1) — decides whether the NEXT real round
  // advances to the next real level or stabilizes at the current one.
  recordRoundOutcome(accuracyRatio: number): void {
    if (accuracyRatio <= STABILIZE_AT_OR_BELOW_ACCURACY) {
      this.stabilizedCount += 1
      return
    }
    this.effectiveLevel = Math.min(this.maxLevel, this.effectiveLevel + 1)
  }
}
