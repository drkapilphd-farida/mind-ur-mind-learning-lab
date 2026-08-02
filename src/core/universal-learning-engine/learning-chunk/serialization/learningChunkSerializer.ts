import type { LearningChunk } from '../types/LearningChunk'
import { validateLearningChunk } from '../validators/validateLearningChunk'

export type DeserializeLearningChunkResult = { success: true; chunk: LearningChunk } | { success: false; error: string }

// Every LearningChunk field is already plain, JSON-safe data (ISO string
// timestamps, no class instances, no Map/Set/undefined-bearing values —
// `enrichment`'s unset fields are simply absent keys) — so serialization
// is JSON.stringify/JSON.parse under the hood, not a hand-rolled format.
export function serializeLearningChunk(chunk: LearningChunk): string {
  return JSON.stringify(chunk)
}

// Runs real structural validation on the parsed payload before returning
// it — a corrupted or malformed payload (crossing a real boundary:
// storage, the wire) is caught here, never silently trusted.
export function deserializeLearningChunk(payload: string): DeserializeLearningChunkResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch {
    return { success: false, error: 'Payload is not valid JSON.' }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { success: false, error: 'Payload is not a LearningChunk object.' }
  }

  const candidate = parsed as LearningChunk
  const result = validateLearningChunk(candidate)
  if (!result.valid) {
    return { success: false, error: `Payload failed LearningChunk validation: ${result.errors.join('; ')}` }
  }

  return { success: true, chunk: candidate }
}
