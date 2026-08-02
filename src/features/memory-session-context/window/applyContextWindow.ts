import type { ContextEntry } from '../domain'
import type { ContextWindowLimits } from './ContextWindowLimits'
import type { TrimmingStrategy } from './TrimmingStrategy'

function payloadSize(entries: readonly ContextEntry[]): number {
  return entries.reduce((total, entry) => total + entry.summary.length, 0)
}

// Pure — never mutates the given array. Applies `maxEntries` first,
// then trims further (one entry at a time, from the configured end)
// until `maxPayloadSize` is satisfied — deterministic, order-preserving
// among survivors either way. A `null` bound is unbounded on that
// dimension.
export function applyContextWindow(
  entries: readonly ContextEntry[],
  limits: ContextWindowLimits,
  strategy: TrimmingStrategy,
): readonly ContextEntry[] {
  let result = entries

  if (limits.maxEntries !== null && result.length > limits.maxEntries) {
    result = strategy === 'drop-oldest' ? result.slice(result.length - limits.maxEntries) : result.slice(0, limits.maxEntries)
  }

  if (limits.maxPayloadSize !== null) {
    while (result.length > 0 && payloadSize(result) > limits.maxPayloadSize) {
      result = strategy === 'drop-oldest' ? result.slice(1) : result.slice(0, -1)
    }
  }

  return result
}
