// Curated word lists for Flash Words™ — grouped by recognition difficulty.
// Short, common words are easier to recognise in a brief flash; longer or
// less frequent words require more visual processing bandwidth.

export const WORDS_SHORT: readonly string[] = [
  'cat', 'dog', 'sun', 'run', 'big', 'sky', 'hot', 'cold',
  'blue', 'fast', 'calm', 'bold', 'read', 'mind', 'grow', 'flow',
  'book', 'time', 'word', 'text', 'page', 'scan', 'view', 'eyes',
]

export const WORDS_MEDIUM: readonly string[] = [
  'focus', 'brain', 'speed', 'light', 'power', 'learn', 'sharp', 'think',
  'clear', 'aware', 'quick', 'grasp', 'reach', 'order', 'found', 'drive',
  'phase', 'range', 'place', 'track', 'build', 'daily', 'habit', 'depth',
]

export const WORDS_LONG: readonly string[] = [
  'reading', 'pattern', 'balance', 'control', 'mastery', 'clarity', 'insight',
  'develop', 'forward', 'capture', 'flowing', 'noticed', 'process', 'learned',
  'focused', 'improve', 'session', 'mindful', 'success', 'journey', 'growing',
]

// All words combined — the exercise picks from the appropriate tier based on
// flash duration (shorter duration → use shorter words for fairness).
export const ALL_WORDS = [...WORDS_SHORT, ...WORDS_MEDIUM, ...WORDS_LONG]

export function getWordsByDifficulty(flashDurationMs: number): readonly string[] {
  if (flashDurationMs >= 300) return ALL_WORDS
  if (flashDurationMs >= 150) return [...WORDS_SHORT, ...WORDS_MEDIUM]
  return WORDS_SHORT
}
