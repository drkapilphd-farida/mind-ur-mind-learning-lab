import { z } from 'zod'

// AI Learning Studio™ Sprint ALS-15 — Version-1 Memory Mode™. The six
// real, named Memory Methods this sprint's own brief lists — a real
// presentation choice, not a new AI-generation pipeline: no real
// concept/relationship/summary data exists anywhere in a production
// Universal Learning Object™ (semantic enrichment is never invoked; see
// `LearningChunk.enrichment`, always `{}`), and this codebase has no
// reusable AI pipeline that transforms arbitrary document text into new
// content (every real `@anthropic-ai/sdk` call site outside AI Mentor™
// only turns performance metrics into short coaching sentences). Every
// method below is therefore an honest, structural presentation of the
// same real chunk data (`ModeChunkView.content`/`title`/`sectionHeading`,
// real `queueIndex`/`totalChunks`) — either a distinct instructional
// prompt coaching the learner to apply the technique themselves (Story,
// Visualization, Association), or a distinct real, structural framing
// (Chunking's real section grouping, Simple Journey's real position,
// Recall Practice's real heading-then-reveal) — never fabricated
// narrative, imagery, or associations.
export type MemoryMethodId = 'story' | 'visualization' | 'association' | 'chunking' | 'journey' | 'recall-practice'

export const MemoryMethodIdSchema = z.enum(['story', 'visualization', 'association', 'chunking', 'journey', 'recall-practice'])

export type MemoryMethodDefinition = {
  id: MemoryMethodId
  label: string
  description: string
  // Shown alongside the real chunk content during an active session, for
  // the three methods that are purely an instructional prompt over the
  // same real content (Story/Visualization/Association). `null` for the
  // three methods whose distinct treatment is structural instead
  // (Chunking/Journey/Recall Practice each render their own real,
  // dynamic framing in `MemoryCard.tsx` — a static instruction string
  // would either duplicate or contradict it).
  instruction: string | null
}

// Order matches the brief's own listing.
export const MEMORY_METHODS: readonly MemoryMethodDefinition[] = [
  { id: 'story', label: 'Story Method', description: 'Link each idea into a story as you go.', instruction: 'Connect this to what came before with a short story in your mind.' },
  { id: 'visualization', label: 'Visualization Method', description: 'Turn each idea into a vivid mental picture.', instruction: 'Picture this vividly — what does it look like?' },
  { id: 'association', label: 'Association Method', description: 'Connect new ideas to things you already know.', instruction: 'What does this remind you of? Find a real connection.' },
  { id: 'chunking', label: 'Chunking Method', description: "Review ideas in the document's own real groups.", instruction: null },
  { id: 'journey', label: 'Simple Journey Method', description: 'Walk through the document as a series of real stops.', instruction: null },
  { id: 'recall-practice', label: 'Recall Practice', description: 'See the prompt, recall it yourself, then check.', instruction: null },
] as const

export function getMemoryMethodDefinition(id: MemoryMethodId): MemoryMethodDefinition {
  const definition = MEMORY_METHODS.find((method) => method.id === id)
  if (!definition) throw new Error(`Unknown Memory Method id: ${id}`)
  return definition
}
