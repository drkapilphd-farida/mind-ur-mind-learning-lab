// AI Mentor™ Sprint-1 — Foundation only. Module registration, routing,
// Server Actions, shared data contracts, and session lifecycle — no
// conversational AI, no coaching UI, no recommendations generation.
// Deliberately NOT registered as a chunk-based `LearningMode`
// (`src/core/learning-mode-integration`) — AI Mentor has no ULO/document
// to schedule chunks through, so forcing it into that contract would
// mean inventing a fake `SessionType`/`ChunkStrategy` neither of which
// reflect reality. Instead, AI Mentor consumes the Shared Learning
// Runtime and each Learning Mode's own real, already-persisted data as
// read-only input — see `context/buildMentorSessionContext.ts`.
export { startMentorSession } from './actions/startMentorSession'
export { endMentorSession } from './actions/endMentorSession'
export { getActiveMentorSession } from './actions/getActiveMentorSession'
export { getMentorSessionContext } from './actions/getMentorSessionContext'

export type { MentorSession, MentorSessionStatus, MentorSessionContext } from './types'
