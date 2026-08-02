// Quantum Speed Reading Sprint (Level 3) + Retention Check (Level 4) —
// share one reading passage per session: 2 comprehension MCQs answered
// live during the sprint itself, plus 2 SEPARATE retention MCQs (testing
// different details of the same passage) answered a short while later in
// Level 4. Own-copy chunking/scoring convention, matching every other
// phase in this flow — never a hand-placed correctIndex (shuffle then
// recompute, the same fix applied after a real bug once shipped that
// way), and an anti-repeat picker so today's passage is never
// yesterday's.

export type ReadingMCQ = { question: string; options: readonly [string, string, string, string]; correctIndex: number }

export type ReadingSet = {
  id: string
  text: string
  comprehensionQuestions: readonly [ReadingMCQ, ReadingMCQ]
  retentionQuestions: readonly [ReadingMCQ, ReadingMCQ]
}

type ReadingQuestionDef = { question: string; options: readonly [string, string, string, string]; correctAnswer: string }
type ReadingSetDef = {
  id: string
  text: string
  comprehensionQuestions: readonly [ReadingQuestionDef, ReadingQuestionDef]
  retentionQuestions: readonly [ReadingQuestionDef, ReadingQuestionDef]
}

const READING_SET_DEFS: readonly ReadingSetDef[] = [
  {
    id: 'quiet-mind-sees-more',
    text: 'A quiet mind sees more in a single glance than a racing mind sees in a minute. When attention stops fragmenting, whole sentences begin to arrive as one clear image instead of a string of separate words. This shift happens gradually, strengthening a little more with every calm session.',
    comprehensionQuestions: [
      {
        question: 'According to the passage, what happens when attention stops fragmenting?',
        options: ['Sentences arrive as one clear image', 'Reading speed slows down', 'Words become harder to see', 'Attention fragments further'],
        correctAnswer: 'Sentences arrive as one clear image',
      },
      {
        question: 'What does a quiet mind do better than a racing mind, per the passage?',
        options: ['See more in a single glance', 'Read one word at a time', 'Forget sentences faster', 'Fragment attention more'],
        correctAnswer: 'See more in a single glance',
      },
    ],
    retentionQuestions: [
      {
        question: 'How does the passage say this shift happens?',
        options: ['Gradually, strengthening with every calm session', 'Instantly, in a single session', 'Only during sleep', 'By reading faster on purpose'],
        correctAnswer: 'Gradually, strengthening with every calm session',
      },
      {
        question: "What replaces 'a string of separate words' once attention stops fragmenting?",
        options: ['One clear image', 'A longer sentence', 'A racing mind', 'A single glance'],
        correctAnswer: 'One clear image',
      },
    ],
  },
  {
    id: 'memory-is-not-storage',
    text: 'Memory is not a storage box you fill and forget. It is a living network that gets stronger every time you retrieve it. The more often a memory is recalled, the deeper its pathway becomes, and the easier it returns the next time.',
    comprehensionQuestions: [
      {
        question: 'How does the passage describe memory?',
        options: ['A living network, not a storage box', 'A box you fill once and forget', 'A pathway that weakens with use', 'A fixed, unchangeable structure'],
        correctAnswer: 'A living network, not a storage box',
      },
      {
        question: 'What happens to a memory pathway the more it is recalled?',
        options: ['It becomes deeper', 'It disappears', 'It stays exactly the same', 'It becomes a storage box'],
        correctAnswer: 'It becomes deeper',
      },
    ],
    retentionQuestions: [
      {
        question: 'What happens to a memory each time it is retrieved, according to the passage?',
        options: ['It gets stronger', 'It gets weaker', 'It gets deleted', 'It stays in a box'],
        correctAnswer: 'It gets stronger',
      },
      {
        question: "What does the passage say happens 'the next time' after a memory is recalled often?",
        options: ['It returns more easily', 'It returns more slowly', 'It stops returning', 'It becomes a new memory'],
        correctAnswer: 'It returns more easily',
      },
    ],
  },
  {
    id: 'intuition-arrives-first',
    text: 'Intuition often arrives before logic has finished its work. The right answer can surface as a feeling, seconds ahead of the reasoning that later explains it. Trusting that first signal is a trainable skill, not a fixed gift some people simply have.',
    comprehensionQuestions: [
      {
        question: 'According to the passage, what can arrive before logic finishes?',
        options: ['Intuition, as a feeling', 'A written explanation', 'A slower answer', 'A repeated question'],
        correctAnswer: 'Intuition, as a feeling',
      },
      {
        question: 'What does the passage say about trusting that first signal?',
        options: ['It is a trainable skill', 'It cannot be learned', 'It always arrives after logic', 'It is unrelated to intuition'],
        correctAnswer: 'It is a trainable skill',
      },
    ],
    retentionQuestions: [
      {
        question: 'How far ahead of the reasoning can the right answer surface as a feeling?',
        options: ['Seconds ahead', 'Hours ahead', 'Days ahead', 'It never surfaces first'],
        correctAnswer: 'Seconds ahead',
      },
      {
        question: 'What does the passage say intuition is NOT, per the last sentence?',
        options: ['A fixed gift some people simply have', 'A trainable skill', 'A feeling', 'A first signal'],
        correctAnswer: 'A fixed gift some people simply have',
      },
    ],
  },
  {
    id: 'right-brain-whole-images',
    text: 'The right hemisphere does not read letter by letter. It processes whole shapes and patterns at once, the same way it recognizes a face in a crowd instantly, without ever spelling out each individual feature. This same instant recognition can be trained onto whole phrases.',
    comprehensionQuestions: [
      {
        question: 'How does the passage say the right hemisphere processes information?',
        options: ['Whole shapes and patterns at once', 'One letter at a time', 'By spelling out each feature', 'Only in a crowd'],
        correctAnswer: 'Whole shapes and patterns at once',
      },
      {
        question: 'What example does the passage use to illustrate this?',
        options: ['Recognizing a face in a crowd', 'Reading a dictionary', 'Counting letters', 'Writing a sentence'],
        correctAnswer: 'Recognizing a face in a crowd',
      },
    ],
    retentionQuestions: [
      {
        question: 'What does the passage say this instant recognition can be trained onto?',
        options: ['Whole phrases', 'Single letters', 'Random symbols', 'Nothing new'],
        correctAnswer: 'Whole phrases',
      },
      {
        question: 'What does the right hemisphere NOT do, per the first sentence?',
        options: ['Read letter by letter', 'Recognize faces', 'Process patterns', 'Work instantly'],
        correctAnswer: 'Read letter by letter',
      },
    ],
  },
  {
    id: 'focus-is-a-muscle',
    text: 'Focus behaves like a muscle, not a fixed trait. Short, consistent daily reps build its endurance far more reliably than one long, exhausting session ever could. Small and steady wins here, the same way it does in any other kind of training.',
    comprehensionQuestions: [
      {
        question: 'How does the passage describe focus?',
        options: ['Like a muscle, not a fixed trait', 'As something you either have or do not', 'As unrelated to daily practice', 'As something only long sessions build'],
        correctAnswer: 'Like a muscle, not a fixed trait',
      },
      {
        question: 'What does the passage say builds endurance more reliably?',
        options: ['Short, consistent daily reps', 'One long exhausting session', 'Avoiding practice entirely', 'A fixed, unchangeable trait'],
        correctAnswer: 'Short, consistent daily reps',
      },
    ],
    retentionQuestions: [
      {
        question: 'What does the passage say wins here?',
        options: ['Small and steady', 'Fast and intense', 'Rare and long', 'Loud and sudden'],
        correctAnswer: 'Small and steady',
      },
      {
        question: 'According to the passage, what does one long, exhausting session fail to do as reliably?',
        options: ['Build endurance', 'Feel tiring', 'Take much time', 'Happen occasionally'],
        correctAnswer: 'Build endurance',
      },
    ],
  },
  {
    id: 'speed-is-a-byproduct',
    text: 'Speed was never the real target. It is what naturally shows up once focus, visualization, and intuition are already working together. Chasing speed directly, on its own, tends to break all three, leaving nothing solid underneath it.',
    comprehensionQuestions: [
      {
        question: 'According to the passage, what is speed?',
        options: ['A byproduct of focus, visualization, and intuition', 'The real, original target', 'Something unrelated to focus', 'A skill trained in isolation'],
        correctAnswer: 'A byproduct of focus, visualization, and intuition',
      },
      {
        question: 'What does the passage say happens when speed is chased directly?',
        options: ['It tends to break the other three abilities', 'It strengthens focus automatically', 'It has no effect at all', 'It becomes the real target'],
        correctAnswer: 'It tends to break the other three abilities',
      },
    ],
    retentionQuestions: [
      {
        question: 'What three abilities does the passage say speed shows up once they work together?',
        options: ['Focus, visualization, and intuition', 'Speed, memory, and logic', 'Reading, writing, and speaking', 'Focus, speed, and memory'],
        correctAnswer: 'Focus, visualization, and intuition',
      },
      {
        question: 'What does the passage say is left when speed is chased directly, on its own?',
        options: ['Nothing solid underneath it', 'A stronger foundation', 'Better focus', 'Improved intuition'],
        correctAnswer: 'Nothing solid underneath it',
      },
    ],
  },
]

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

function buildQuestion(def: ReadingQuestionDef): ReadingMCQ {
  const shuffledOptions = shuffle(def.options)
  const correctIndex = shuffledOptions.indexOf(def.correctAnswer)
  if (correctIndex === -1) {
    throw new Error(`buildQuestion: correctAnswer "${def.correctAnswer}" not found among options for "${def.question}"`)
  }
  return { question: def.question, options: shuffledOptions as [string, string, string, string], correctIndex }
}

function buildReadingSet(def: ReadingSetDef): ReadingSet {
  return {
    id: def.id,
    text: def.text,
    comprehensionQuestions: [buildQuestion(def.comprehensionQuestions[0]), buildQuestion(def.comprehensionQuestions[1])],
    retentionQuestions: [buildQuestion(def.retentionQuestions[0]), buildQuestion(def.retentionQuestions[1])],
  }
}

export const READING_SETS: readonly ReadingSet[] = READING_SET_DEFS.map(buildReadingSet)

let lastSelectedSetId: string | null = null

export function pickRandomReadingSet(): ReadingSet {
  let candidate: ReadingSet
  do {
    const randomIndex = Math.floor(Math.random() * READING_SETS.length)
    const picked = READING_SETS[randomIndex]
    if (picked === undefined) throw new Error('pickRandomReadingSet: index out of range')
    candidate = picked
  } while (READING_SETS.length > 1 && candidate.id === lastSelectedSetId)
  lastSelectedSetId = candidate.id
  return candidate
}

// --- Chunking engine — one continuous, text-wide progression ---------------
//
// Not per-sentence any more (that design restarted at a single word for
// every new sentence, which no longer reads as "gradual"). Instead the
// WHOLE passage is treated as one flat word stream with four ordered
// phases, each strictly larger than the last, and never repeated:
//   1. RSVP        — exactly one word per stage, for the first ~35% of
//                    the text (a real word-by-word flash, not a "chunk
//                    of size 1" that's actually the start of a sentence
//                    the eye keeps re-reading).
//   2. 2-word chunk — the next ~25% of the text.
//   3. 3-word chunk — the next ~20% of the text.
//   4. Phrase       — the remaining ~20%, grouped into ~5-word phrases —
//                    never the original full sentence.
// A group is cut short (never merged across the boundary) whenever the
// word it just consumed ends a sentence, so a flashed group never reads
// as two unrelated sentence fragments stitched together. Every word in
// the source text appears in exactly one stage, in order — the four
// phases partition the passage, they don't re-show any of it.
export type ChunkStageKind = 'word' | 'microChunk2' | 'microChunk3' | 'phrase'
export type ChunkStage = { kind: ChunkStageKind; text: string; wordCount: number }

const MS_PER_WORD = 60_000 / 230 // ~230 WPM target pace
// The RSVP floor is deliberately snappier than the later phases — a
// genuine rapid single-word flash, not just "the smallest chunk size."
const STAGE_DURATION_FLOOR_MS: Record<ChunkStageKind, number> = {
  word: 280,
  microChunk2: 500,
  microChunk3: 650,
  phrase: 850,
}
const STAGE_DURATION_CEILING_MS = 3_000

const RSVP_SHARE = 0.35
const MICRO_CHUNK_2_SHARE = 0.25
const MICRO_CHUNK_3_SHARE = 0.2
// Phrase phase gets whatever remains (~20%).
const PHRASE_TARGET_SIZE = 5

function endsSentence(word: string): boolean {
  return /[.!?]$/.test(word)
}

export function buildChunkSequence(text: string): readonly ChunkStage[] {
  const words = text.split(/\s+/).filter((word) => word.length > 0)
  const totalWords = words.length
  if (totalWords === 0) return []

  const rsvpEnd = Math.max(1, Math.round(totalWords * RSVP_SHARE))
  const microChunk2End = rsvpEnd + Math.max(1, Math.round(totalWords * MICRO_CHUNK_2_SHARE))
  const microChunk3End = microChunk2End + Math.max(1, Math.round(totalWords * MICRO_CHUNK_3_SHARE))

  const stages: ChunkStage[] = []
  let index = 0

  // Phase 1 — RSVP: exactly one word per stage.
  while (index < rsvpEnd && index < totalWords) {
    const word = words[index]
    if (word === undefined) break
    stages.push({ kind: 'word', text: word, wordCount: 1 })
    index += 1
  }

  // Consumes up to `targetSize` words into one stage, stopping early
  // (never merging across) the moment a consumed word ends a sentence.
  function consumeGroup(targetSize: number, kind: ChunkStageKind): void {
    const groupWords: string[] = []
    while (groupWords.length < targetSize && index < totalWords) {
      const word = words[index]
      if (word === undefined) break
      groupWords.push(word)
      index += 1
      if (endsSentence(word)) break
    }
    if (groupWords.length > 0) {
      stages.push({ kind, text: groupWords.join(' '), wordCount: groupWords.length })
    }
  }

  // Phase 2 — 2-word chunks.
  while (index < microChunk2End && index < totalWords) {
    consumeGroup(2, 'microChunk2')
  }

  // Phase 3 — 3-word chunks.
  while (index < microChunk3End && index < totalWords) {
    consumeGroup(3, 'microChunk3')
  }

  // Phase 4 — phrases (never the original full sentence).
  while (index < totalWords) {
    consumeGroup(PHRASE_TARGET_SIZE, 'phrase')
  }

  return stages
}

export function getStageDurationMs(stage: ChunkStage): number {
  const raw = stage.wordCount * MS_PER_WORD
  const floor = STAGE_DURATION_FLOOR_MS[stage.kind]
  return Math.min(STAGE_DURATION_CEILING_MS, Math.max(floor, raw))
}

export function getTotalWordCount(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length
}

// --- Timing & scoring -------------------------------------------------------

export const RECALL_TIME_LIMIT_MS = 6_000
export const COUNTDOWN_STATES: readonly string[] = ['3', '2', '1', 'GO!']
export const COUNTDOWN_TOTAL_MS = 3_000
export const COUNTDOWN_STEP_MS = COUNTDOWN_TOTAL_MS / COUNTDOWN_STATES.length

export function computeWpm(totalWordCount: number, totalDurationMs: number): number {
  if (totalDurationMs <= 0) return 0
  return Math.round((totalWordCount / totalDurationMs) * 60_000)
}

// Weighted blend of two honestly-measured signals — speed capped at a
// 300 WPM ceiling for the 0-100 scale, combined with raw accuracy so a
// lucky guess can't inflate the score on its own.
export function computeReadingPowerScore(wpm: number, accuracyPercent: number): number {
  const speedComponent = Math.min(100, Math.round((wpm / 300) * 100))
  return Math.round(speedComponent * 0.6 + accuracyPercent * 0.4)
}

export function computeReadingXp(readingScore: number): number {
  return 50 + Math.round(readingScore * 0.5)
}

export function computeRetentionXp(correctCount: number, totalCount: number): number {
  const base = correctCount * 25
  const perfectBonus = totalCount > 0 && correctCount === totalCount ? 10 : 0
  return base + perfectBonus
}
