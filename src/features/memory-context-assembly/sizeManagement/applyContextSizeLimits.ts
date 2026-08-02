import type { ContextSection } from '../domain'
import type { ContextSizeLimits } from './ContextSizeLimits'
import { trimSectionsToMemoryCount } from './trimSectionsToMemoryCount'
import { trimSectionsToPayloadSize } from './trimSectionsToPayloadSize'

// Pure — never mutates the given array. Applies `maxSections` first
// (drop lowest-priority sections beyond the cap), then
// `maxMemoryCount` (trim references across the remaining sections),
// then `maxPayloadSize` as a final holistic check. Each stage is a
// no-op when its limit is `null`.
export function applyContextSizeLimits(sections: readonly ContextSection[], limits: ContextSizeLimits): readonly ContextSection[] {
  let result = sections

  if (limits.maxSections !== null && result.length > limits.maxSections) {
    result = result.slice(0, limits.maxSections)
  }

  if (limits.maxMemoryCount !== null) {
    result = trimSectionsToMemoryCount(result, limits.maxMemoryCount)
  }

  if (limits.maxPayloadSize !== null) {
    result = trimSectionsToPayloadSize(result, limits.maxPayloadSize)
  }

  return result
}
