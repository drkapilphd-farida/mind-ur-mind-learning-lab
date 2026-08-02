import type { SessionType } from './ExperienceIntelligence'

// Universal Learning Object™ (UCE-6) — RESERVED. The brief's separate
// "SESSION BLUEPRINTS" section: "Design production-ready session
// blueprint models... Reserve models for: Reading Session, Memory
// Session, Revision Session, Research Session, Practice Session." One
// shared type parameterized by `SessionType` (reused verbatim from
// ExperienceIntelligence.ts, never redefined) — not five near-identical
// types, avoiding the exact "duplicate models" this sprint's own
// verification section forbids. Type only; no builder function, no
// populated instances this sprint — real session records require a real
// Learning Session Engine, explicitly out of scope ("Do NOT implement...
// Session Engine").
export type SessionBlueprint = {
  type: SessionType
  learnerId: string
  documentId: string
  conceptNodeIds: readonly string[]
  estimatedDurationSeconds: number
}
