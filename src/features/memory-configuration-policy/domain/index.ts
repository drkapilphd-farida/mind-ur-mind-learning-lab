// Memory Configuration & Policy Engine™ domain models (Sprint 20).
// Pure TypeScript, no framework dependency, fully self-contained —
// zero imports from any other feature ("No cross-feature imports").

export type { ConfigurationKey } from './ConfigurationKey'
export type { ConfigurationValue } from './ConfigurationValue'
export type { ConfigurationEntry } from './ConfigurationEntry'
export type { ConfigurationProfile } from './ConfigurationProfile'
export type { ConfigurationMetadata } from './ConfigurationMetadata'
export type { MemoryConfiguration } from './MemoryConfiguration'
export { mergeConfigurationEntries } from './mergeConfigurationEntries'
