// Business logic for the `ai` API domain — thin by design. The AI
// subsystem itself (routing/providers/prompts/cache/economics/mentor/
// learning-dna/events) lives in `src/ai/`, its own bounded context (see
// docs/adr/0002-domain-layered-architecture.md); this module exists only
// so `api/ai/` has a `services/ai/` to delegate to, matching the other
// five domains' layering.

export { runAIRequest } from '@/ai/services'
