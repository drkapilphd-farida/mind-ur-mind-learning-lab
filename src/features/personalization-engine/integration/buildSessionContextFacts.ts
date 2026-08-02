import type { SessionContext } from '@/features/memory-session-context'
import type { PersonalizationFacts } from '../domain'

// Pure — reduces a "Session Context" input (a `SessionContext` from
// the approved AI Memory Engine™) down to flat facts.
export function buildSessionContextFacts(sessionContext: SessionContext | null): PersonalizationFacts {
  if (!sessionContext) return {}

  return {
    entryCount: sessionContext.entries.length,
    lifecycle: sessionContext.lifecycle,
  }
}
