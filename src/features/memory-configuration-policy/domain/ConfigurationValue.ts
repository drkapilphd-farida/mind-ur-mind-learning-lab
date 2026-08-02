// Deliberately restricted to plain, trivially-serializable primitives
// — no nested objects/arrays — so every configuration value is
// unambiguous to compare, merge, and diff (see
// `snapshot/compareConfigurationSnapshots.ts`) without a real
// deep-equality dependency.
export type ConfigurationValue = string | number | boolean
