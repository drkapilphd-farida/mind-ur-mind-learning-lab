// The identifiers a ResponseMapper needs but can't derive from a
// RawProviderResult alone — generated/known by BaseProviderAdapter
// before mapping (the response id via IdGenerator, the provider and
// resolved model ids), passed in rather than re-derived.
export type ResponseMapperContext = {
  id: string
  providerId: string
  modelId: string
}
