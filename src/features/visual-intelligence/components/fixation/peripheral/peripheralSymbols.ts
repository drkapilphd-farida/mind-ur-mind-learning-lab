// Visual Intelligence Lab™ — Visual Fixation Engine™, Sprint 5.
// The symbol/number pool used for Peripheral Activation™'s edge flashes and
// the recall step's distractor options.

export const PERIPHERAL_SYMBOLS = ['3', '7', '9', '4', '2', '5', '8', '6'] as const

export function pickRandomSymbol(): string {
  return PERIPHERAL_SYMBOLS[Math.floor(Math.random() * PERIPHERAL_SYMBOLS.length)]!
}

// Builds a 4-option set (1 real + 3 distractors) for the recall ChoiceGrid,
// shuffled so the correct answer isn't always in the same position.
export function buildRecallOptions(correctSymbol: string): { options: string[]; correctIndex: number } {
  const pool = PERIPHERAL_SYMBOLS.filter((symbol) => symbol !== correctSymbol)
  const distractors: string[] = []
  const remaining = [...pool]
  while (distractors.length < 3 && remaining.length > 0) {
    const index = Math.floor(Math.random() * remaining.length)
    distractors.push(remaining.splice(index, 1)[0]!)
  }

  const options = [correctSymbol, ...distractors]
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j]!, options[i]!]
  }

  return { options, correctIndex: options.indexOf(correctSymbol) }
}
