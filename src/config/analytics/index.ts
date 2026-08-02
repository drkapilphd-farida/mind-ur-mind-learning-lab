// Runtime feature flags for the `analytics` domain. `false` — no code
// path writes to `audit_logs` yet.
export const ANALYTICS_CONFIG = {
  auditLoggingEnabled: false,
} as const
