// Compile-time constants for the `auth` domain. Mirrors the CHECK
// constraints in
// supabase/migrations/20260711000001_create_families_and_members.sql —
// keep in sync if that migration's constraints ever change.

export const FAMILY_MEMBER_TYPES = ['owner', 'adult', 'child'] as const
export const FAMILY_MEMBER_STATUSES = ['invited', 'active', 'removed'] as const

export const DEFAULT_MAX_FAMILY_MEMBERS = 6
