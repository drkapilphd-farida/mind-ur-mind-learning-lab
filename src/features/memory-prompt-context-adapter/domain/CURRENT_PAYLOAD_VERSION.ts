import type { ContextPayloadVersion } from './ContextPayloadVersion'

// The one payload version this sprint's transformation engine
// produces. `validation/isSupportedPayloadVersion.ts` and
// `serialization/` both check *against* this same constant, so
// bumping it in one place is enough to introduce a new version.
export const CURRENT_PAYLOAD_VERSION: ContextPayloadVersion = 1
