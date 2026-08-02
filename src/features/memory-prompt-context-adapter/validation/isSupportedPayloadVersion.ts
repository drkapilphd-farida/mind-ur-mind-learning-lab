import type { ContextPayloadVersion } from '../domain'
import { CURRENT_PAYLOAD_VERSION } from '../domain'

// Every payload version this engine can produce or read. Only one
// today — bumping `CURRENT_PAYLOAD_VERSION` and adding an entry here
// is how a future version becomes supported without breaking payloads
// already serialized under an older one.
const SUPPORTED_PAYLOAD_VERSIONS: readonly ContextPayloadVersion[] = [CURRENT_PAYLOAD_VERSION]

export function isSupportedPayloadVersion(version: ContextPayloadVersion): boolean {
  return SUPPORTED_PAYLOAD_VERSIONS.includes(version)
}
