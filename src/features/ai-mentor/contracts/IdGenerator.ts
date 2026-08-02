// Injected wherever conversation/ needs a new id — same reasoning as
// Clock: never a direct `crypto.randomUUID()` call inside a factory,
// so tests can supply deterministic, predictable ids.
export interface IdGenerator {
  generate(): string
}
