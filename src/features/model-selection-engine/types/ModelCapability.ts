// Same 7-capability vocabulary this whole arc has used since
// `provider-adapter-layer` (Sprint 36) — independently re-declared
// here (not imported), same "self-contained mirror" posture as every
// prior sprint.
export type ModelCapability =
  | 'chat-completion'
  | 'vision'
  | 'function-calling'
  | 'json-output'
  | 'streaming-support'
  | 'reasoning-support'
  | 'multimodal'
