// Memory Prompt Context Adapter™ domain models (Sprint 22). Pure
// TypeScript, no framework dependency. Deliberately imports `MemoryId`
// (`@/features/memory-persistence`) and `ContextPriority`
// (`@/features/memory-context-assembly`) — this sprint's own checklist
// permits "cross-feature imports... [within] approved Memory Engine
// modules" — see this feature's root `index.ts` for the full
// justification.

export type { ContextPayloadVersion } from './ContextPayloadVersion'
export { CURRENT_PAYLOAD_VERSION } from './CURRENT_PAYLOAD_VERSION'
export type { ContextPayloadReference } from './ContextPayloadReference'
export type { ContextPayloadSection } from './ContextPayloadSection'
export type { ContextPayloadMetadata } from './ContextPayloadMetadata'
export type { ContextPayload } from './ContextPayload'
