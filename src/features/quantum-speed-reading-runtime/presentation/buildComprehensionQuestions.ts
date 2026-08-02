import type { ModeChunkView } from '@/features/learning-mode-runtime'
import type { DocumentComprehensionSignal } from './listDocumentComprehensionSignals'

export type ComprehensionQuestionOption = {
  value: string
  isCorrect: boolean
}

export type ComprehensionQuestion = {
  kind: 'main-idea' | 'concept' | 'entity' | 'misconception'
  prompt: string
  options: readonly ComprehensionQuestionOption[]
}

const MAX_QUESTION_OPTIONS = 4
const PROMPTS: Record<ComprehensionQuestion['kind'], string> = {
  'main-idea': 'What was the main idea of what you just read?',
  concept: 'Which of these concepts was covered in what you just read?',
  entity: 'Which of these was mentioned in what you just read?',
  misconception: 'Which of these is a common misconception related to what you just read?',
}

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Comprehension
// Check™. Mirrors `mcqs-mode-runtime/presentation/buildStructureQuestion.ts`
// exactly: pure, deterministic (seeded by the chunk's own real, stable
// `chunkNodeId` — the same chunk always shows the same real question and
// option order), every option a real value pulled from this same real
// document's own AI-extracted enrichment, never invented text. Builds one
// real question per available signal kind on the current chunk — the
// caller picks which to show. Returns an empty array, honestly, for a
// chunk with no real enrichment yet (enrichment skipped/failed) rather
// than fabricating a question with no real grounding.
export function buildComprehensionQuestions(chunk: ModeChunkView, allSignals: readonly DocumentComprehensionSignal[]): readonly ComprehensionQuestion[] {
  const ownSignalsByKind = groupByKind(allSignals.filter((signal) => signal.chunkNodeId === chunk.chunkNodeId))
  const questions: ComprehensionQuestion[] = []

  for (const kind of ['main-idea', 'concept', 'entity', 'misconception'] as const) {
    const ownValues = ownSignalsByKind[kind] ?? []
    if (ownValues.length === 0) continue

    const seed = hashString(`${chunk.chunkNodeId}-${kind}`)
    const correctValue = ownValues[seed % ownValues.length]
    if (correctValue === undefined) continue

    const distractorPool = dedupeValues(allSignals.filter((signal) => signal.kind === kind && signal.chunkNodeId !== chunk.chunkNodeId).map((signal) => signal.value), correctValue)
    if (distractorPool.length === 0) continue

    const distractors = seededShuffle(distractorPool, seed).slice(0, MAX_QUESTION_OPTIONS - 1)
    const options: ComprehensionQuestionOption[] = [{ value: correctValue, isCorrect: true }, ...distractors.map((value) => ({ value, isCorrect: false }))]

    questions.push({ kind, prompt: PROMPTS[kind], options: seededShuffle(options, seed + 1) })
  }

  return questions
}

function groupByKind(signals: readonly DocumentComprehensionSignal[]): Partial<Record<DocumentComprehensionSignal['kind'], readonly string[]>> {
  const result: Partial<Record<DocumentComprehensionSignal['kind'], string[]>> = {}
  for (const signal of signals) {
    const bucket = result[signal.kind] ?? []
    bucket.push(signal.value)
    result[signal.kind] = bucket
  }
  return result
}

function dedupeValues(values: readonly string[], exclude: string): readonly string[] {
  const excludeNormalized = exclude.trim().toLowerCase()
  const seen = new Set([excludeNormalized])
  const result: string[] = []
  for (const value of values) {
    const normalized = value.trim().toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(value)
  }
  return result
}

// A real, deterministic hash — the same input always produces the same
// seed, never `Math.random()`. Not cryptographic; only needed to vary
// distractor selection/order per chunk in a stable, reproducible way —
// same implementation as `mcqs-mode-runtime`'s own, duplicated per this
// codebase's established self-contained-feature-folder convention.
function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return hash >>> 0
}

// Deterministic PRNG (mulberry32) + Fisher-Yates shuffle.
function seededShuffle<T>(items: readonly T[], seed: number): readonly T[] {
  let state = seed
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1))
    const temp = result[i]
    result[i] = result[j] as T
    result[j] = temp as T
  }
  return result
}
