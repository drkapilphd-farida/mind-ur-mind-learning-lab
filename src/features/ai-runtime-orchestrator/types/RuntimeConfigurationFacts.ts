// Self-contained — independently re-declared per this whole session's
// own convention (same shape as
// `ai-mentor-personalization-bridge`'s own `MentorConfigurationFacts`,
// never imported cross-feature).
export type RuntimeConfigurationFacts = Readonly<Record<string, string | number | boolean>>
