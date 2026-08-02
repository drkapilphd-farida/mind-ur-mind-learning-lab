import type { AIModelCapabilities } from '@/features/ai-provider/types'
import type { SupportedProviderId } from './SupportedProviderId'

// "Provider Capability Matrix" — one capability summary per supported
// provider, derived (not hand-maintained) from the AI Model Registry —
// see catalog/buildProviderCapabilityMatrix.ts. A provider's entry here
// is the union of every one of its catalog models' capabilities.
export type ProviderCapabilityMatrix = Record<SupportedProviderId, AIModelCapabilities>
