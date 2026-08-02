import type { SessionContext, SessionId } from '../domain'

// "Extend repository contracts to support... Save/Load/Archive/Delete
// session context. Maintain backward compatibility." This sprint's
// domain (SessionContext) is new — there is no pre-existing repository
// contract to literally extend via `extends`, so "extend" here means:
// grow this codebase's family of repository contracts with one more,
// following the exact same Promise-based, framework-agnostic shape as
// every other repository in this codebase (e.g.
// `@/features/memory-persistence/contracts/MemoryRepository.ts`,
// independently mirrored, not imported — "No cross-feature imports").
// `archive()` is a mechanical persistence-layer operation — it does
// not itself validate lifecycle legality; that business rule lives in
// `orchestration/DefaultContextOrchestrationService.ts` ("business
// rules remain outside repository implementations").
export interface SessionContextRepository {
  save(context: SessionContext): Promise<void>
  load(id: SessionId): Promise<SessionContext | null>
  archive(id: SessionId): Promise<SessionContext>
  delete(id: SessionId): Promise<void>
}
