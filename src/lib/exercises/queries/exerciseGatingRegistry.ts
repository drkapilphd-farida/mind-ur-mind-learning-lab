import type { LabId } from '../types'
import type { ExerciseSequenceItem } from '../sequence'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'
import { FLASH_INTELLIGENCE_MODULE } from '@/features/flash-intelligence/flashIntelligenceModule'

// Single source of truth for "which gated sequence, if any, governs this
// exercise" — every currently-gated sequence in the platform is registered
// once here. This is a REGISTRY (a lookup of which array to check), not a
// duplicate of the authorization logic itself — the actual eligibility
// computation still lives exclusively in getModuleProgress/deriveAvailability,
// reused as-is by both getExerciseAccess (page render) and
// verifyExerciseIsUnlocked (write-time enforcement) via this same lookup.
//
// An exercise absent from every sequence here has "no lock sequence of its
// own yet" and stays unconditionally allowed, exactly as before.
const GATED_SEQUENCES: Record<LabId, readonly (readonly ExerciseSequenceItem[])[]> = {
  'quantum-speed-reading': [READING_EXPANSION_MODULE, EYE_FOUNDATION_MODULE, FLASH_INTELLIGENCE_MODULE],
  'memory-intelligence': [],
  'focus-intelligence': [],
  'visual-intelligence': [],
}

// Returns the sequence that governs `exerciseId` within `labId`, or null
// if this exercise isn't part of any gated sequence.
export function findGatingSequence(labId: LabId, exerciseId: string): readonly ExerciseSequenceItem[] | null {
  const sequences = GATED_SEQUENCES[labId] ?? []
  return sequences.find((sequence) => sequence.some((item) => item.exerciseId === exerciseId)) ?? null
}
