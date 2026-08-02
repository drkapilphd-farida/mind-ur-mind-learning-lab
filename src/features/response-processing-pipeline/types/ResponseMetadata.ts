// Immutable — every field `readonly`. `ResponseMetadataExtractor`'s own
// output — defaults to empty strings when the raw metadata payload is
// `null`.
export type ResponseMetadata = {
  readonly modelUsed: string
  readonly requestId: string
}
