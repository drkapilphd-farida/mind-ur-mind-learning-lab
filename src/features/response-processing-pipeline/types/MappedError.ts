// Immutable — every field `readonly`. `ErrorResponseMapper`'s own
// output — `null` when the raw response carries no error payload.
export type MappedError = {
  readonly code: string
  readonly message: string
}
