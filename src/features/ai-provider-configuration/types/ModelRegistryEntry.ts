import type { AIModelCapabilities } from '@/features/ai-provider/types'
import type { SupportedProviderId } from './SupportedProviderId'

// The "AI Model Registry" — pure catalog data describing a model a
// future real provider integration could route to. Reuses
// ai-provider's own AIModelCapabilities shape (Sprint 5, read-only —
// not duplicated) since it's the same concept; this entry is never
// instantiated into a live AIProvider/AIModel object the way
// ai-provider's own catalog is — it exists purely as configuration,
// independent of whether the provider it names has a real adapter yet.
export type ModelRegistryEntry = {
  id: string
  providerId: SupportedProviderId
  displayName: string
  capabilities: AIModelCapabilities
}
