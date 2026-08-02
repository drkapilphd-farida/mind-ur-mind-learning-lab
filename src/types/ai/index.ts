// Domain types for `ai` — the *database row* shape only. Mirrors the
// `ai_events` table from
// supabase/migrations/20260711000004_create_ai_events.sql. The AI
// subsystem's own internal contracts (AIRequest/AIResponse/provider
// interfaces) live in `src/ai/types/`, not here — see
// docs/adr/0002-domain-layered-architecture.md.

export type AIEvent = {
  id: string
  userId: string
  learningSessionId: string | null
  eventType: string
  provider: string
  model: string
  inputTokens: number | null
  outputTokens: number | null
  costCents: number | null
  metadata: Record<string, unknown>
  createdAt: string
}
