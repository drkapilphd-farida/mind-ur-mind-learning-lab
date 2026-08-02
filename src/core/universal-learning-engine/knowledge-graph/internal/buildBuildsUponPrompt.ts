import type { AIFoundationPayload } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'

const SYSTEM_INSTRUCTION = `You are an expert instructional designer mapping how one section of real learning material builds on concepts introduced earlier in the same document.
Return ONLY a single, valid JSON object — no prose before or after it, no markdown code fences — with exactly this shape:

{
  "relationships": [
    { "concept": string, "buildsOnConcept": string, "confidence": number between 0 and 1 }
  ]
}

"concept" must be one of this chunk's own concepts (listed below). "buildsOnConcept" must be one of the already-introduced concepts (listed below) that this chunk's concept genuinely builds upon. Only include a relationship when the chunk's real content actually builds on that prior concept — never invent a connection that isn't really there. If nothing in this chunk builds on any prior concept, return { "relationships": [] }.`

// Learning Knowledge Graph™ (UCE-4). Pure. The one AI-derived edge type
// this sprint (`builds-upon`), reusing AIFoundation's own
// 'relationship-detection' task (declared in AIF-1, never consumed by
// any engine until now). One call per chunk — never per concept pair —
// so cost/latency stays O(chunks), the same profile as UCE-3B's own
// per-chunk enrichment call, required given "Future million-node
// scalability."
export function buildBuildsUponPrompt(chunk: LearningChunk, chunkConcepts: readonly string[], alreadyIntroducedConcepts: readonly string[]): AIFoundationPayload {
  const contextLines = [
    `This chunk's own concepts: ${chunkConcepts.length > 0 ? chunkConcepts.join(', ') : '(none)'}`,
    `Concepts already introduced earlier in this document: ${alreadyIntroducedConcepts.length > 0 ? alreadyIntroducedConcepts.join(', ') : '(none)'}`,
    '',
    'Content:',
    chunk.content,
  ]

  return {
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: contextLines.join('\n') },
    ],
  }
}
