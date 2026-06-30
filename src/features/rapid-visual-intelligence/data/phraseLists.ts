// Short phrases for Flash Phrases™ — deliberately readable and positive to
// reinforce the transformation experience. Length increases with difficulty.

export const PHRASES_SHORT: readonly string[] = [
  'read fast', 'stay calm', 'mind grows', 'eyes open', 'think clear',
  'be present', 'go deeper', 'stay sharp', 'build focus', 'move forward',
]

export const PHRASES_MEDIUM: readonly string[] = [
  'mind over matter', 'keep going now', 'see more clearly', 'read with ease',
  'train your brain', 'stay in flow', 'grow every day', 'focus builds speed',
  'notice every word', 'trust the process',
]

export const PHRASES_LONG: readonly string[] = [
  'your brain is adapting', 'reading speed is growing', 'focus creates clarity',
  'every session builds strength', 'consistency is your power',
  'your mind is accelerating', 'pattern recognition improves',
]

export function getPhrasesByDifficulty(flashDurationMs: number): readonly string[] {
  if (flashDurationMs >= 400) return PHRASES_LONG
  if (flashDurationMs >= 200) return PHRASES_MEDIUM
  return PHRASES_SHORT
}
