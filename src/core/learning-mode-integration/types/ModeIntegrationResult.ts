import type { AdaptiveRuntimeState, RuntimeActionError, RuntimeEvent } from '@/core/adaptive-learning-runtime'
import type { ModeIntegrationError } from './ModeIntegrationError'

// Learning Mode Runtime Integration™ (LSE-4). The result shape
// `startModeRuntime` returns — reuses LSE-2's own `AdaptiveRuntimeState`/
// `RuntimeEvent`/`RuntimeActionError` verbatim; the only new member is this
// layer's own `ModeIntegrationError`, for the two real failures (§see
// ModeIntegrationError.ts) that can only happen at this integration layer,
// never inside LSE-2 itself.
export type ModeIntegrationResult = { success: true; state: AdaptiveRuntimeState; events: readonly RuntimeEvent[] } | { success: false; error: RuntimeActionError | ModeIntegrationError }
