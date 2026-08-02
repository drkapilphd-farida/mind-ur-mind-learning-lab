// External contract for the `ai` domain — thin by design (see
// docs/adr/0002-domain-layered-architecture.md). Delegates to
// services/ai/, which itself just re-exports the `src/ai/` subsystem —
// the one seam the rest of the app should call AI through.

export { runAIRequest } from '@/services/ai'
