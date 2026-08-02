// A plain string alias — e.g. `"memory.retention.maxAgeDays"`. Not an
// enum: this feature is generic infrastructure for "all Memory Engine
// components" (per the Sprint 20 objective), so it never hard-codes
// any other feature's specific setting names.
export type ConfigurationKey = string
