// Same reasoning as Clock — injected, self-contained, not imported
// from another feature.
export interface IdGenerator {
  generate(): string
}
