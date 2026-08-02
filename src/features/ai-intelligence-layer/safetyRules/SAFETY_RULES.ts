import type { SafetyRule } from '../types'

// "Centralize rules" — the examples given in the Sprint 7 brief,
// verbatim, plus their converse-stated ids for reference.
export const SAFETY_RULES: readonly SafetyRule[] = [
  { id: 'no-medical-advice', description: 'No medical advice.' },
  { id: 'no-diagnosis', description: 'No diagnosis.' },
  { id: 'no-hallucinated-scores', description: 'No hallucinated scores.' },
  { id: 'no-fake-progress', description: 'No fake progress.' },
  { id: 'no-invented-data', description: 'No invented data.' },
  { id: 'educational-guidance-only', description: 'Educational guidance only.' },
] as const
