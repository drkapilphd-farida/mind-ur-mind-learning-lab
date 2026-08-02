import type { PerformanceDomain, PerformanceSignal } from '../types/PerformanceSignal'
import type { AdaptiveChallengeEstimate } from '../types/AdaptiveChallengeEstimate'
import { estimateAdaptiveChallenge } from './estimateAdaptiveChallenge'

// Learning Intelligence Engine™ — Sprint-1 skeleton. "This is NOT a
// ChatGPT wrapper. This is the proprietary intelligence engine of the
// platform." Sprint-1 scope: a real, working in-memory accumulator +
// real adaptive estimation (via `estimateAdaptiveChallenge`) over
// whatever signals are recorded during one discovery session — proves
// the pipeline end-to-end without persisting a new table (the three
// `*_discovery_sessions` tables remain the durable record; this engine
// is the client-side runtime that would, in a future sprint, read from
// them across sessions too). No signal emission is wired into
// Reading/Memory/Focus Discovery's own live components yet — that's the
// real engine work Sprint-2/3/4 build; this class is the seam they call
// into.
export class LearningIntelligenceEngine {
  private signals: PerformanceSignal[] = []

  recordSignal(signal: PerformanceSignal): void {
    this.signals.push(signal)
  }

  getSnapshot(): readonly PerformanceSignal[] {
    return this.signals
  }

  getAdaptiveEstimate(domain: PerformanceDomain): AdaptiveChallengeEstimate {
    return estimateAdaptiveChallenge(domain, this.signals)
  }

  reset(): void {
    this.signals = []
  }
}
