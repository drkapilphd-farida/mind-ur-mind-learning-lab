// Memory Context Assembly Pipeline™ domain models (Sprint 21). Pure
// TypeScript, no framework dependency. `ContextReference` links to
// `@/features/memory-persistence`'s `MemoryId` only — the one
// deliberate, read-only cross-feature dependency this sprint's own
// brief calls for explicitly ("Applies existing query/filter
// infrastructure... Applies retention eligibility... Applies session
// context rules... Reuse existing infrastructure wherever possible") —
// see this feature's root `index.ts` for the full justification.

export type { ContextPriority } from './ContextPriority'
export type { ContextReference } from './ContextReference'
export type { ContextSection } from './ContextSection'
export type { ContextPackageMetadata } from './ContextPackageMetadata'
export type { ContextPackage } from './ContextPackage'
