// A flat, self-contained bag of configuration facts — same shape as
// `ai-mentor-personalization-bridge`'s and `ai-mentor-response-composer`'s
// own `MentorConfigurationFacts`, independently declared rather than
// imported, so this feature's `types/`, `validation/`, `assembly/`, and
// `orchestration/` never need to import another feature directly —
// only `../integration/` does.
export type MentorConfigurationFacts = Readonly<Record<string, string | number | boolean>>
