// Sprint-13 — Micro Victory System™. Two shared pools (headline +
// encouragement), reused at every exercise-completion point in the Lab so
// every screen speaks the same calm, premium voice — per the brief's own
// "Consistency" requirement, this is intentionally ONE shared pool rather
// than per-exercise-type copy. `pickMicroVictoryLine` avoids repeating the
// line that was just shown; it doesn't need to remember more than that —
// the brief asks for variety, not a strict no-repeat-ever guarantee.
export const MICRO_VICTORY_HEADLINES: readonly string[] = [
  'Neural Pathways Strengthening™',
  'Excellent Focus™',
  'Brain Response Improved™',
  'Reading Rhythm Improving™',
  'Visual System Activated™',
  "You're Building Reading Momentum™",
]

export const MICRO_VICTORY_MESSAGES: readonly string[] = [
  'Your brain adapts through consistency.',
  'Small improvements become massive gains.',
  'Momentum is building.',
  'Each session reshapes how your brain reads.',
  'Your visual system is learning.',
  'Your brain is adapting with every rep.',
  'Every rep is rewiring your focus.',
  'Consistency is the real skill here.',
]

export function pickMicroVictoryLine(pool: readonly string[], lastShown: string | null): string {
  const candidates = pool.length > 1 && lastShown !== null ? pool.filter((line) => line !== lastShown) : pool
  const index = Math.floor(Math.random() * candidates.length)
  return candidates[index] ?? pool[0]!
}
