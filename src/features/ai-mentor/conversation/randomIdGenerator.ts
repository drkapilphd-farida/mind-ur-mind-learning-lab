import type { IdGenerator } from '../contracts'

// The real default IdGenerator implementation — the only place in this
// feature that calls `crypto.randomUUID()` directly.
export const randomIdGenerator: IdGenerator = {
  generate: () => crypto.randomUUID(),
}
