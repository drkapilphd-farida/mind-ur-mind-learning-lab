import type { ModeChunkView } from '@/features/learning-mode-runtime'
import { excerptContent } from '@/lib/learning-modes/excerptContent'
import type { DocumentSectionHeading } from './listDocumentSectionHeadings'
import type { DocumentDefinition } from './listDocumentDefinitions'

export type StructureQuestionOption = {
  chunkNodeId: string
  heading: string
  isCorrect: boolean
}

export type StructureQuestion =
  | { kind: 'excerpt-to-heading'; prompt: string; excerpt: string; isExcerpt: boolean; options: readonly StructureQuestionOption[] }
  | { kind: 'heading-to-next'; prompt: string; heading: string; options: readonly StructureQuestionOption[] }
  | { kind: 'definition-to-term'; prompt: string; definition: string; options: readonly StructureQuestionOption[] }

const MAX_QUESTION_OPTIONS = 4
const MAX_EXCERPT_LENGTH = 320

// MCQs™ — AI Learning Studio™ Sprint ALS-17. Honest, disclosed scope, the
// same reasoning Mind Map™/Flashcards™ (ALS-13) and Memory Mode™'s six
// Memory Methods (ALS-15) already established: no real comprehension
// question exists anywhere in this ULO without semantic enrichment (AI,
// never called), and no reusable AI-generation pipeline exists in this
// codebase outside AI Mentor's own conversation logic (confirmed by
// dedicated investigation ahead of this sprint). Fabricating "what does
// this mean" questions would violate this sprint's own "do not introduce
// new AI pipelines" rule. These are real *structural* questions instead —
// about the document's own real organization, answerable purely from
// real `location.order` and real headings, never content meaning:
//   - `excerpt-to-heading`: a real excerpt of the current chunk's own
//     real content; the correct option is that same chunk's own real
//     heading.
//   - `heading-to-next`: the current chunk's own real heading; the
//     correct option is the real heading of the chunk immediately after
//     it in real document order.
// Every option (correct and distractor) is a real heading pulled from
// this same document — never invented text. Distractor selection and
// option order are deterministic (seeded by the chunk's own real,
// stable `chunkNodeId`), so the same chunk always presents the same real
// question and options on every render, refresh, and resume — never a
// re-shuffled surprise. Returns `null`, honestly, when the document
// doesn't have at least two real, distinct headings to build a
// meaningful question from (an extremely short document) — never a
// fabricated single-option "question."
//
// Production AI Integration — ALS-24. A third kind, `definition-to-term`,
// takes priority over the two structural kinds above when this chunk has
// at least one real, AI-extracted `enrichment.definitions` entry AND
// enough distinct real terms exist elsewhere in the document to build
// real distractors — a genuine comprehension question about what a real
// term means, not just where it sits in the document. Every definition
// and every distractor term is real, pulled from `listDocumentDefinitions.ts`
// — never invented. Falls back to the exact existing structural logic
// when a chunk has no real definitions yet (enrichment skipped/failed) or
// the document doesn't have enough distinct terms elsewhere to build a
// real distractor set.
export function buildStructureQuestion(chunk: ModeChunkView, allHeadings: readonly DocumentSectionHeading[], allDefinitions: readonly DocumentDefinition[] = []): StructureQuestion | null {
  const definitionQuestion = buildDefinitionToTermQuestion(chunk, allDefinitions)
  if (definitionQuestion !== null) return definitionQuestion

  const distinctHeadings = dedupeByChunkNodeId(allHeadings)
  if (distinctHeadings.length < 2) return null

  const ownHeading = distinctHeadings.find((candidate) => candidate.chunkNodeId === chunk.chunkNodeId)
  if (ownHeading === undefined) return null

  const seed = hashString(chunk.chunkNodeId)
  const useNextHeadingQuestion = chunk.order % 2 === 0
  const nextHeading = distinctHeadings.find((candidate) => candidate.order === chunk.order + 1)

  if (useNextHeadingQuestion && nextHeading !== undefined) {
    const options = buildOptions(distinctHeadings, chunk.chunkNodeId, nextHeading, seed)
    if (options === null) return null
    return { kind: 'heading-to-next', prompt: 'Which real section comes right after this one?', heading: ownHeading.heading, options }
  }

  const options = buildOptions(distinctHeadings, chunk.chunkNodeId, ownHeading, seed)
  if (options === null) return null

  const { text, isExcerpt } = excerptContent(chunk.content, MAX_EXCERPT_LENGTH)
  return { kind: 'excerpt-to-heading', prompt: 'Which real section does this excerpt belong to?', excerpt: text, isExcerpt, options }
}

function buildDefinitionToTermQuestion(chunk: ModeChunkView, allDefinitions: readonly DocumentDefinition[]): StructureQuestion | null {
  const ownDefinitions = allDefinitions.filter((candidate) => candidate.chunkNodeId === chunk.chunkNodeId)
  if (ownDefinitions.length === 0) return null

  const seed = hashString(chunk.chunkNodeId)
  const correct = ownDefinitions[seed % ownDefinitions.length]
  if (correct === undefined) return null

  const seenTerms = new Set([normalizeTerm(correct.term)])
  const distractorPool: DocumentDefinition[] = []
  for (const candidate of allDefinitions) {
    if (candidate.chunkNodeId === chunk.chunkNodeId) continue
    const normalized = normalizeTerm(candidate.term)
    if (seenTerms.has(normalized)) continue
    seenTerms.add(normalized)
    distractorPool.push(candidate)
  }
  if (distractorPool.length === 0) return null

  const distractors = seededShuffle(distractorPool, seed).slice(0, MAX_QUESTION_OPTIONS - 1)
  const options: StructureQuestionOption[] = [
    { chunkNodeId: correct.chunkNodeId, heading: correct.term, isCorrect: true },
    ...distractors.map((distractor) => ({ chunkNodeId: distractor.chunkNodeId, heading: distractor.term, isCorrect: false })),
  ]

  return { kind: 'definition-to-term', prompt: 'Which real term does this definition describe?', definition: correct.definition, options: seededShuffle(options, seed + 1) }
}

function normalizeTerm(term: string): string {
  return term.trim().toLowerCase()
}

function buildOptions(allHeadings: readonly DocumentSectionHeading[], excludeChunkNodeId: string, correct: DocumentSectionHeading, seed: number): readonly StructureQuestionOption[] | null {
  const distractorPool = allHeadings.filter((candidate) => candidate.chunkNodeId !== correct.chunkNodeId && candidate.chunkNodeId !== excludeChunkNodeId)
  if (distractorPool.length === 0) return null

  const distractors = seededShuffle(distractorPool, seed).slice(0, MAX_QUESTION_OPTIONS - 1)
  const options: StructureQuestionOption[] = [
    { chunkNodeId: correct.chunkNodeId, heading: correct.heading, isCorrect: true },
    ...distractors.map((distractor) => ({ chunkNodeId: distractor.chunkNodeId, heading: distractor.heading, isCorrect: false })),
  ]

  return seededShuffle(options, seed + 1)
}

function dedupeByChunkNodeId(headings: readonly DocumentSectionHeading[]): readonly DocumentSectionHeading[] {
  const seen = new Set<string>()
  const result: DocumentSectionHeading[] = []
  for (const heading of headings) {
    if (seen.has(heading.chunkNodeId)) continue
    seen.add(heading.chunkNodeId)
    result.push(heading)
  }
  return result
}

// A real, deterministic hash — the same chunk id always produces the
// same seed, never `Math.random()`. Not cryptographic; only needed to
// vary distractor selection/order per chunk in a stable, reproducible way.
function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return hash >>> 0
}

// Deterministic PRNG (mulberry32) + Fisher-Yates shuffle — the same seed
// always produces the same shuffle, so a resumed or refreshed session
// shows the exact same real question and option order it showed before.
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
