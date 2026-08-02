// Domain types for `auth` — account & access concerns: RBAC (roles/
// permissions) and family accounts. Mirrors the `roles`, `permissions`,
// `user_roles`, `families`, `family_members` tables from
// supabase/migrations/20260711000001_create_families_and_members.sql and
// 20260711000006_create_roles_and_permissions.sql — see
// docs/adr/0001-ai-learning-studio-domain-model.md.

export type Role = {
  id: string
  key: string
  name: string
  description: string | null
  createdAt: string
}

export type Permission = {
  id: string
  key: string
  description: string | null
  createdAt: string
}

export type UserRole = {
  id: string
  userId: string
  roleId: string
  // Null = a global role assignment; set = scoped to that family.
  familyId: string | null
  createdAt: string
}

export type FamilyMemberType = 'owner' | 'adult' | 'child'
export type FamilyMemberStatus = 'invited' | 'active' | 'removed'

export type Family = {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export type FamilyMember = {
  id: string
  familyId: string
  // Null for a child member with no account of their own.
  userId: string | null
  memberType: FamilyMemberType
  displayName: string | null
  status: FamilyMemberStatus
  createdAt: string
  updatedAt: string
}
