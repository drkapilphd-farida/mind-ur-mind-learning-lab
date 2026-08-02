// Immutable — every field `readonly`. A deterministic, caller-supplied
// stand-in for a provider-side error payload.
export type RawErrorPayload = {
  readonly code: string
  readonly message: string
}
