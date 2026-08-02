import type { BrainGymDrillConfig } from '../types'

const SYMBOL_POOL = ['★', '▲', '■', '●', '◆', '♥'] as const

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j] as T
    copy[j] = temp as T
  }
  return copy
}

// Fast Pattern Blinking™ — a single symbol blinks on screen for a split
// second, then vanishes entirely before the 4 answer options appear
// (hidePromptDuringResponse — unlike the other 3 drills, which keep the
// prompt visible into the response phase). The whole point here is
// genuine flash-recall, not reading a still-visible answer off the
// stimulus.
export const FAST_PATTERN_BLINKING_CONFIG: BrainGymDrillConfig = {
  exerciseId: 'fast-pattern-blinking',
  labId: 'quantum-speed-reading',
  title: 'Fast Pattern Blinking™',
  instructions: 'A symbol blinks on screen for a split second, then vanishes. Catch it before it’s gone, then pick what you saw.',
  roundCount: 16,
  stimulusDurationMs: 220,
  hidePromptDuringResponse: true,
  storageKey: 'qsr-fast-pattern-blinking-best',
  completeHeading: 'Fast Eyes!',
  completeSubline: 'Your visual recognition speed is climbing.',
  buildRound: () => {
    const shuffled = shuffle(SYMBOL_POOL)
    const correctSymbol = shuffled[0]!
    const optionSymbols = shuffle(shuffled.slice(0, 4))
    return {
      promptLabel: correctSymbol,
      options: optionSymbols.map((symbol) => ({ id: symbol, label: symbol })),
      correctOptionId: correctSymbol,
    }
  },
}
