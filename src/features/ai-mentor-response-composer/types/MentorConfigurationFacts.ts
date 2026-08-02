// A flat, self-contained bag of configuration facts — same shape as
// `ai-mentor-personalization-bridge`'s own `MentorConfigurationFacts`
// and the Personalization Engine's™ `PersonalizationFacts`,
// independently declared rather than imported, so this feature's
// `types/`, `validation/`, `composition/`, and `orchestration/` never
// need to import another feature directly — only `../integration/` does.
export type MentorConfigurationFacts = Readonly<Record<string, string | number | boolean>>
