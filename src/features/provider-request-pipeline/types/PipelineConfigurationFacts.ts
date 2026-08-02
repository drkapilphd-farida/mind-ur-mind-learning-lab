// A flat, self-contained bag of configuration facts — same shape as
// every prior sprint's own configuration-facts type, independently
// declared rather than imported, so this feature's `types/`,
// `validation/`, `pipeline/`, and `orchestration/` never need to
// import another feature directly — only `../integration/` does.
export type PipelineConfigurationFacts = Readonly<Record<string, string | number | boolean>>
