// "## Provider Capabilities" (§ brief), verbatim — metadata only, no
// implementation behind any of these.
export type ProviderAdapterCapability =
  | 'chat-completion'
  | 'vision'
  | 'function-calling'
  | 'json-output'
  | 'streaming-support'
  | 'reasoning-support'
  | 'multimodal'
