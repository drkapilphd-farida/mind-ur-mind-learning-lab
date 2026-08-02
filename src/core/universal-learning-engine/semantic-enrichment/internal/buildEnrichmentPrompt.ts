import type { AIFoundationPayload } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'

const SYSTEM_INSTRUCTION = `You are an expert instructional designer analyzing one section of real learning material.
Read the chunk of content provided and return ONLY a single, valid JSON object — no prose before or after it, no markdown code fences — with exactly this shape:

{
  "summary": string,
  "concepts": string[],
  "keywords": string[],
  "importantTerms": string[],
  "definitions": [{"term": string, "definition": string}],
  "entities": string[],
  "learningObjectives": string[],
  "misconceptions": string[],
  "examples": string[],
  "prerequisites": string[],
  "dependencies": string[],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "importance": number between 0 and 1,
  "confidence": number between 0 and 1
}

Every field must be grounded in the real content given to you — never invent facts, examples, or terms that are not actually present in or directly implied by the text. If a category genuinely does not apply to this content, return an empty array (or omit the field) rather than fabricating an entry. "prerequisites" and "dependencies" must be concept names (e.g. "basic algebra"), never ids. "confidence" is your own honest self-assessment of how reliable this analysis is for this specific chunk.`

// Semantic Enrichment Engine™ — UCE-3B. Pure — builds one real prompt
// requesting every UCE-3B-owned ChunkEnrichment category in a single
// structured JSON response, per this sprint's "one combined request per
// chunk, not thirteen" design. Sends the chunk's full real `content`
// (never truncated/re-summarized before sending — UCE-3A's own ~200-word
// chunk target already keeps this well within any real model's context
// window) plus real, already-known context (document title, section
// heading) so the model isn't asked to guess at information this engine
// already has.
export function buildEnrichmentPrompt(chunk: LearningChunk, document: UniversalLearningDocument): AIFoundationPayload {
  const contextLines = [
    `Document: ${document.title}`,
    chunk.location.sectionHeading ? `Section: ${chunk.location.sectionHeading}` : null,
    '',
    'Content:',
    chunk.content,
  ].filter((line): line is string => line !== null)

  return {
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: contextLines.join('\n') },
    ],
  }
}
