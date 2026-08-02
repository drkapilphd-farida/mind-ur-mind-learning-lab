// Runtime feature flags for the `auth` domain. `false` everywhere this
// sprint — flip to `true` once the corresponding services/auth/
// function is actually implemented and a page calls api/auth/ for it.
export const AUTH_CONFIG = {
  familyAccountsEnabled: false,
} as const
