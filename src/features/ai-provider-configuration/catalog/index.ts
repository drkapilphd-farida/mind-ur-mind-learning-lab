import { MODEL_REGISTRY } from './MODEL_REGISTRY'
import { buildProviderCapabilityMatrix } from './buildProviderCapabilityMatrix'
import type { ProviderCapabilityMatrix } from '../types'

export { SUPPORTED_PROVIDERS } from './SUPPORTED_PROVIDERS'
export { MODEL_REGISTRY } from './MODEL_REGISTRY'
export { buildProviderCapabilityMatrix } from './buildProviderCapabilityMatrix'

// The Provider Capability Matrix computed once from the real, current
// MODEL_REGISTRY — the convenience most callers actually want, rather
// than every call site re-deriving it from the registry itself.
export const PROVIDER_CAPABILITY_MATRIX: ProviderCapabilityMatrix = buildProviderCapabilityMatrix(MODEL_REGISTRY)
