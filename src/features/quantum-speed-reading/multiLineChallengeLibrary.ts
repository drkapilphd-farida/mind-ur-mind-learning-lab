// Multi-Line Reading™ Challenge Library — a reusable, future-ready
// registry of "which line…" question types. Every type produces the same
// answer shape (4 options = 4 of the paragraph's own lines; the correct
// option is whichever line satisfies the criterion), so adding a new type
// later is a new entry here, not a rearchitecture.
//
// Two named brief types collapse into one generator: Type 1 ("which line
// contained: {word}") and Type 6 ("which line contained this exact word")
// are mechanically identical — pick a real, salient word from a line, ask
// which line had it — so they share `keyword-line` with rotating prompt
// copy rather than two artificially-distinct implementations.
//
// Type 7 ("which line flashed") is not built — the brief itself gates it
// behind a highlight-during-reading mode that doesn't exist ("only if
// highlight mode is active"). It isn't stubbed here at all — no placeholder
// type, no dead branch — this registry shape is exactly the seam a future
// highlight mode would plug a new type into.

export type MultiLineChallengeType = 'keyword-line' | 'ending-word-line' | 'person-line' | 'location-line' | 'number-line'

export const MULTI_LINE_CHALLENGE_TYPES: readonly MultiLineChallengeType[] = [
  'keyword-line', 'ending-word-line', 'person-line', 'location-line', 'number-line',
]

// keyword-line / ending-word-line reveal the specific word being searched
// for (the question IS "match this word to its line"). person-line /
// location-line / number-line are pure category recall — revealing the
// exact number or name beforehand would make the question trivial or
// nonsensical — so nothing is shown beyond the category prompt itself.
export function multiLineChallengeShowsContext(type: MultiLineChallengeType): boolean {
  return type === 'keyword-line' || type === 'ending-word-line'
}

const KEYWORD_PROMPTS = ['Which line contained: {word}?', 'Which line contained this exact word: {word}?'] as const

export function multiLineChallengePrompt(type: MultiLineChallengeType, contextWord: string | null, seed: number): string {
  if (type === 'keyword-line') {
    // Deliberately not routed through pickItems/shuffleArray here: verified
    // live that shuffleIndices(2, seed) is heavily biased toward returning
    // the same result for small/sequential seeds (confirmed degenerate for
    // seeds 0-199 specifically) — a real bug in the shared
    // randomizationEngine.ts, out of scope to fix in this mission-only
    // turn given its cross-cutting blast radius on every other exercise.
    // Modulo on the seed sidesteps the buggy pathway entirely for this
    // 2-element rotation.
    const template = KEYWORD_PROMPTS[Math.abs(seed) % KEYWORD_PROMPTS.length]!
    return template.replace('{word}', contextWord ?? '')
  }
  if (type === 'ending-word-line') return `Which line ended with: ${contextWord ?? ''}?`
  if (type === 'person-line') return 'Which line mentioned a person?'
  if (type === 'location-line') return 'Which line mentioned a location?'
  return 'Which line contained a number?'
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'to', 'and', 'is', 'was', 'are', 'were', 'for', 'with', 'on', 'at', 'by',
  'from', 'that', 'this', 'these', 'those', 'it', 'its', 'as', 'but', 'or', 'not', 'be', 'has', 'have',
  'had', 'will', 'can', 'could', 'would', 'should', 'their', 'his', 'her', 'they', 'he', 'she', 'we',
  'you', 'i', 'than', 'then', 'more', 'most', 'very', 'also', 'such', 'into', 'over', 'under', 'about',
  'after', 'before', 'during', 'through', 'while', 'each', 'every', 'other', 'some', 'any', 'all', 'no',
  'only', 'just', 'still', 'even', 'much', 'many', 'own', 'same', 'often', 'so', 'if', 'when', 'where',
])

function stripPunctuation(word: string): string {
  return word.replace(/[.,!?;:'"]+$/g, '').replace(/^['"]+/g, '')
}

// A line's "content words" — real candidates for a keyword-line question:
// long enough to be distinctive, not a stopword.
export function contentWords(line: string): string[] {
  return line
    .split(/\s+/)
    .map(stripPunctuation)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w.toLowerCase()))
}

export function lastWord(line: string): string {
  const words = line.split(/\s+/)
  return stripPunctuation(words[words.length - 1] ?? '')
}

const NUMBER_PATTERN = /\d/

export function lineHasNumber(line: string): boolean {
  return NUMBER_PATTERN.test(line)
}
