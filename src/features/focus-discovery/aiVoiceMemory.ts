// AI Presence Engine™ — Sprint-1.9. "AI should internally remember
// patterns... use these observations later... never repeat the same
// feedback." "Silence is often more intelligent than unnecessary
// feedback." One real, small, session-scoped memory — held in a single
// ref at the orchestrator level so it persists across all 5 real
// missions (never recreated per-mission).

export type MissionRatioTrend = 'improving' | 'declining' | 'steady' | null

// How far apart two consecutive real mission ratios (0-1) must be before
// this reads as a real, meaningful trend rather than ordinary noise.
const TREND_THRESHOLD = 0.15

export class AiVoiceMemory {
  private readonly shownLines = new Set<string>()
  private readonly missionRatios: number[] = []

  // Real "never repeat the same feedback": returns the first real
  // candidate not already shown this session, marking it shown. Once
  // every real candidate for this exact context has already been said,
  // this returns `null` — real, deliberate silence, never a forced
  // repeat.
  pickLine(candidates: readonly string[]): string | null {
    for (const candidate of candidates) {
      if (!this.shownLines.has(candidate)) {
        this.shownLines.add(candidate)
        return candidate
      }
    }
    return null
  }

  // Call once, right after each real mission finishes, with that
  // mission's own real performance ratio (0-1) — `computeMissionRatio`
  // in `focusIntelligenceEngine.ts` is the one real, shared source for
  // this number.
  recordMissionRatio(ratio: number): void {
    this.missionRatios.push(ratio)
  }

  // A real, simple cross-mission trend — comparing this mission's own
  // real ratio to the immediately PRIOR mission's. `null` until a real
  // second data point exists (the very first mission has nothing to
  // compare against).
  getTrend(): MissionRatioTrend {
    if (this.missionRatios.length < 2) return null
    const current = this.missionRatios[this.missionRatios.length - 1]!
    const previous = this.missionRatios[this.missionRatios.length - 2]!
    if (current - previous >= TREND_THRESHOLD) return 'improving'
    if (previous - current >= TREND_THRESHOLD) return 'declining'
    return 'steady'
  }
}
