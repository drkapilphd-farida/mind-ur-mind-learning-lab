export type ReadingConfidenceLevel = 'low' | 'medium' | 'high'

const HIGH_PAUSE_COUNT_THRESHOLD = 3
const LOW_COMPLETION_THRESHOLD = 50

// Quantum Speed Reading Hub Experience™ (Sprint-1) — Reading Confidence.
// A real, disclosed, deterministic band over signals the current session
// already tracks (`RuntimeMetrics.pauseCount`, `SessionSnapshot.
// completionPercentage`) — never a fabricated precise score ("no
// percentages required," per this brief), same qualitative-banding
// discipline the Lab's own `weaknessDetectorEngine.ts` already
// established for its own real signals. A high real pause count or a low
// real completion rate reads as still-building confidence; steady
// progress with few pauses reads as high.
export function resolveReadingConfidence(signals: { completionPercentage: number; pauseCount: number }): ReadingConfidenceLevel {
  if (signals.pauseCount >= HIGH_PAUSE_COUNT_THRESHOLD || signals.completionPercentage < LOW_COMPLETION_THRESHOLD) {
    return 'low'
  }

  if (signals.pauseCount === 0 && signals.completionPercentage >= LOW_COMPLETION_THRESHOLD) {
    return 'high'
  }

  return 'medium'
}
