// What BaseProviderAdapter.execute() returns before a ResponseMapper
// turns it into a real AIResponse — the mock's own deterministic
// shape; a real adapter's execute() would return whatever its SDK
// call actually returned instead.
export type RawProviderResult = {
  text: string
  promptTokens: number
  completionTokens: number
}
