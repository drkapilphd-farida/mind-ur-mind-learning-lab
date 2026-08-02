// External contract for the `auth` domain — thin by design (see
// docs/adr/0002-domain-layered-architecture.md). Delegates to
// services/auth/ and does nothing else; this is the module a future
// Server Action or route handler imports from.

export { listFamiliesForUser, inviteFamilyMember, listRolesForUser } from '@/services/auth'
export type { InviteFamilyMemberInput } from '@/services/auth'
