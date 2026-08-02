import type { AIModelCapabilities } from './AIModelCapabilities'

// ProviderFactory's input — "Support selecting providers by: provider
// id, preferred model, fallback model, capabilities, future pricing."
// `maxCostCentsPerRequest` is the "future pricing" criterion named in
// the brief: accepted and typed today, but ProviderFactory (this
// chunk) does not yet filter by it — no real per-request cost model
// exists to compare against (CostEstimation is deterministic mock
// data). Left as a documented, inert field rather than silently
// dropped, so a future chunk can wire it in without a type change.
export type ProviderSelectionCriteria = {
  providerId?: string
  preferredModelId?: string
  fallbackModelId?: string
  requiredCapabilities?: readonly (keyof AIModelCapabilities)[]
  maxCostCentsPerRequest?: number
}
