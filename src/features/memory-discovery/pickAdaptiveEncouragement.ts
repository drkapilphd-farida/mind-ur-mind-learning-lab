// Adaptive Memory Coach™ — Sprint-3 FIX-07.
//
// "Feedback should react to behaviour... After several correct answers:
// 'You're remembering faster now.' After improvement: 'Nice progress.'
// After mistakes: 'Let's try another one.' Never mention failure. Never
// mention reduced difficulty." A real, short line reflecting this
// session's own real cross-mission streak (the Adaptive Memory Coach™'s
// own `consecutiveCorrect`/`consecutiveIncorrect` span every real
// mission completed so far, not just one) — `null` when neither
// condition is real yet, so Mission Complete doesn't clutter itself with
// a forced line every single time.

import type { AdaptiveMemoryCoach } from './adaptiveMemoryCoach'

const STRONG_STREAK_MESSAGE = 'You’re remembering faster now.'
const RECOVERY_MESSAGE = 'Let’s try another one.'
const STRONG_STREAK_THRESHOLD = 2

export function pickAdaptiveEncouragement(coach: AdaptiveMemoryCoach): string | null {
  const { consecutiveCorrect, consecutiveIncorrect } = coach.getStreakCounters()
  if (consecutiveCorrect >= STRONG_STREAK_THRESHOLD) return STRONG_STREAK_MESSAGE
  if (consecutiveIncorrect >= 1) return RECOVERY_MESSAGE
  return null
}
