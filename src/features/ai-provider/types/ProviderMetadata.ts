// Describes a provider itself — distinct from AIModel, which describes
// one of that provider's models. `supportsFineTuning` is this sprint's
// one concrete "Future Ready" extension point encoded as data rather
// than left purely as a comment: a future fine-tuning feature can
// filter providers by this flag today, even though nothing reads it
// yet.
export type ProviderMetadata = {
  id: string
  displayName: string
  description: string
  supportsFineTuning: boolean
}
