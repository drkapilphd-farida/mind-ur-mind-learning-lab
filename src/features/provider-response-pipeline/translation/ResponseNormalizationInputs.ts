// The already-reduced, fully self-contained correlation inputs the
// normalizers consume — real reduction from `ProviderExecutionRequest`
// happens in `../integration/buildResponseNormalizationInputs.ts`.
export type ResponseNormalizationInputs = {
  readonly learnerId: string
  readonly profileId: string
}
