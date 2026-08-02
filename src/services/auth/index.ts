// Business logic for the `auth` domain (RBAC + family accounts). Every
// function throws until a future sprint implements it against
// supabase/migrations/20260711000001_create_families_and_members.sql and
// 20260711000006_create_roles_and_permissions.sql — see
// docs/adr/0002-domain-layered-architecture.md. `api/auth/` is the only
// intended caller.

import { NotImplementedError } from '@/lib/errors'
import type { Family, FamilyMember, Role } from '@/types/auth'

export async function listFamiliesForUser(userId: string): Promise<readonly Family[]> {
  throw new NotImplementedError(`listFamiliesForUser(${userId}) — Family Accounts sprint`)
}

export type InviteFamilyMemberInput = {
  familyId: string
  displayName: string
  memberType: FamilyMember['memberType']
}

export async function inviteFamilyMember(input: InviteFamilyMemberInput): Promise<FamilyMember> {
  throw new NotImplementedError(`inviteFamilyMember(familyId=${input.familyId}) — Family Accounts sprint`)
}

export async function listRolesForUser(userId: string): Promise<readonly Role[]> {
  throw new NotImplementedError(`listRolesForUser(${userId}) — RBAC sprint`)
}
