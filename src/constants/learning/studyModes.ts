import { FileText, GraduationCap, HelpCircle, Layers, ListChecks, Network, RotateCcw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type StudyModeId = 'flashcards' | 'quiz' | 'mind-map' | 'summary' | 'revision' | 'practice' | 'teach-me'

export type StudyModeDefinition = {
  id: StudyModeId
  label: string
  description: string
  icon: LucideIcon
  estimatedMinutes: number
}

// Sprint 2, Chunk 3 — the seven Study Modes, replacing Sprint 1 Chunk
// 4's ad hoc five-card Study Actions list. Icon references live here
// safely because this constant is only ever imported directly by
// Client Components (LearningBlueprintExperience) — never passed as a
// prop across the Server→Client boundary, which is the only place a
// LucideIcon reference actually breaks (see ShellNavItem/iconRegistry,
// Sprint 0). Durations for the five modes shared with the Learning
// Journey™ (flashcards/quiz/mind-map/practice/revision — Chunk 2's
// JOURNEY_STEPS) are kept numerically in sync by hand since both lists
// are fixed, non-generated content; Summary and Teach Me are new modes
// with no journey-step counterpart.
export const STUDY_MODES: readonly StudyModeDefinition[] = [
  { id: 'flashcards', label: 'Flashcards', description: 'Review key terms and ideas with spaced repetition.', icon: Layers, estimatedMinutes: 10 },
  { id: 'quiz', label: 'Quiz', description: 'Test your understanding with adaptive questions.', icon: HelpCircle, estimatedMinutes: 10 },
  { id: 'mind-map', label: 'Mind Map', description: 'See how every concept connects to the others.', icon: Network, estimatedMinutes: 8 },
  { id: 'summary', label: 'Summary', description: 'Get a concise recap of everything covered.', icon: FileText, estimatedMinutes: 5 },
  { id: 'revision', label: 'Revision', description: 'Revisit key concepts to build lasting memory.', icon: RotateCcw, estimatedMinutes: 10 },
  { id: 'practice', label: 'Practice', description: "Apply what you've learned with guided questions.", icon: ListChecks, estimatedMinutes: 15 },
  { id: 'teach-me', label: 'Teach Me', description: 'Have this material explained to you, step by step.', icon: GraduationCap, estimatedMinutes: 12 },
] as const
