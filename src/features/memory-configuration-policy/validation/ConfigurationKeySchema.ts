import type { ConfigurationKey } from '../domain'

export type ConfigurationValueType = 'string' | 'number' | 'boolean'

// One key's declared contract — "Required values, Invalid values,
// ...Unsupported overrides" are all checked against this schema (see
// `validateConfiguration.ts`).
export type ConfigurationKeySchema = {
  readonly key: ConfigurationKey
  readonly required: boolean
  readonly type: ConfigurationValueType
  readonly allowOverride: boolean
}
