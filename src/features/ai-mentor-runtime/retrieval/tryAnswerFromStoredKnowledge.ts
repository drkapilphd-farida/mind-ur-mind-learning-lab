import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'

// Production AI Cost Optimization — Task 7. AI Mentor's real
// retrieval-before-Claude gate, honestly scoped. No embeddings/vector
// infrastructure exists anywhere in this codebase — `ChunkEnrichment`'s
// own `embeddingId`/`vectorId` fields are explicitly reserved-but-
// unpopulated ("no embeddings capability exists yet in the AI Foundation
// Layer for any engine to call"), and building one from scratch would be
// exactly the kind of new-architecture undertaking this mission's own
// "reuse existing architecture, do not redesign" constraint forbids. This
// is the real, narrow, honest alternative: a definition-style question
// ("what is X" / "what are X" / "define X" / "what does X mean") is
// answered directly from a real, matching `chunk.enrichment.definitions`
// entry already produced by UCE-3B for the learner's own most recently
// active document — no Claude call, no fabrication, no paraphrasing
// beyond the model's own already-stored real definition. Every other
// question — the large majority of real conversational messages — returns
// `null`, falling straight through to the existing, unmodified
// `generateMentorReply` call.
const WHAT_IS_PATTERN = /^what\s+(?:is|are)\s+(?:a\s+|an\s+|the\s+)?(.+?)\??$/i
const DEFINE_PATTERN = /^define\s+(?:a\s+|an\s+|the\s+)?(.+?)\??$/i
const WHAT_DOES_MEAN_PATTERN = /^what\s+does\s+(?:a\s+|an\s+|the\s+)?(.+?)\s+mean\??$/i

function extractDefinitionTerm(message: string): string | null {
  const trimmed = message.trim()
  for (const pattern of [WHAT_IS_PATTERN, DEFINE_PATTERN, WHAT_DOES_MEAN_PATTERN]) {
    const match = trimmed.match(pattern)
    const term = match?.[1]?.trim()
    if (term && term.length > 0) return term
  }
  return null
}

// Pure. Returns a real, honestly-sourced answer string, or `null` when no
// high-confidence stored match exists — never a guess, never a partial
// match dressed up as a real one.
export function tryAnswerFromStoredKnowledge(ulo: UniversalLearningObject, message: string): string | null {
  const term = extractDefinitionTerm(message)
  if (term === null) return null

  const normalizedTerm = term.toLowerCase()

  for (const chunk of ulo.knowledge.chunks) {
    const match = (chunk.enrichment.definitions ?? []).find((definition) => definition.term.trim().toLowerCase() === normalizedTerm)
    if (match) {
      return `${match.term}: ${match.definition}`
    }
  }

  return null
}
