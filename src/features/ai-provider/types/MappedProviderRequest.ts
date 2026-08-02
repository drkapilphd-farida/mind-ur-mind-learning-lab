// The provider-shaped intermediate a RequestMapper produces from a
// generic AIRequest — deliberately generic/mock-shaped today (a flat
// prompt string), not any real provider's actual wire format. A future
// real RequestMapper (OpenAI, Claude, ...) would produce that
// provider's own shape instead; nothing upstream of RequestMapper ever
// sees this type.
export type MappedProviderRequest = {
  modelId: string
  prompt: string
  maxOutputTokens: number
}
