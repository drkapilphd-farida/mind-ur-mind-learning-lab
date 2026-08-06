export type SchoolType = 'school' | 'franchise_partner'
export type SchoolTier = 'tier_50' | 'tier_100' | 'tier_200' | 'tier_500_plus'
export type SchoolStatus = 'active' | 'suspended' | 'archived'
// franchise_partner is the school_admin-equivalent role for a
// franchise_partner-type tenant (see is_school_admin() in
// 20260805000003_add_franchise_partner_support.sql, which treats both
// the same) — not a different permission level, just a different tenant
// type's "top of tenant" identity.
export type SchoolMemberRole = 'school_admin' | 'franchise_partner' | 'teacher' | 'student'
export type SchoolMemberStatus = 'active' | 'removed'

// The two "top of tenant" admin roles — mirrors is_school_admin()'s own
// `role IN ('school_admin', 'franchise_partner')` check, kept in one
// place so every server-side authorization check (addStudentManually,
// updateTenantBranding, ...) stays in sync with the SQL side.
export const TENANT_ADMIN_ROLES: readonly SchoolMemberRole[] = ['school_admin', 'franchise_partner']

// The Razorpay-driven payment lifecycle (see 20260807000001_add_tenant_billing.sql).
// 'unlinked' is the default for every tenant today (no subscription
// linked yet); 'created' means linked but not yet confirmed active by
// Razorpay. Deliberately independent of SchoolStatus — a billing webhook
// only ever writes paymentStatus/expiresAt, never status (see
// billing.ts).
export type PaymentStatus = 'unlinked' | 'created' | 'active' | 'past_due' | 'canceled'
export type BillingCycle = 'monthly' | 'yearly'

export type School = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  type: SchoolType
  tier: SchoolTier
  maxStudents: number
  monthlyAiQuota: number
  status: SchoolStatus
  ownerId: string
  // Subscription/renewal — null means no expiry (the default for every
  // tenant today unless a Razorpay subscription is linked and charged).
  // See subscriptionStatus.ts for how this becomes an Active/Expiring
  // Soon/Expired label.
  expiresAt: string | null
  razorpaySubscriptionId: string | null
  razorpayCustomerId: string | null
  billingCycle: BillingCycle | null
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}

export type SchoolMember = {
  id: string
  schoolId: string
  userId: string
  role: SchoolMemberRole
  status: SchoolMemberStatus
  username: string | null
  rollNumber: string | null
  createdAt: string
  updatedAt: string
}

export type SchoolMemberWithProfile = SchoolMember & {
  fullName: string | null
}

export type SchoolClass = {
  id: string
  schoolId: string
  name: string
  gradeLevel: string | null
  section: string | null
  createdAt: string
  updatedAt: string
}

export const SCHOOL_TIER_DEFAULT_MAX_STUDENTS: Record<SchoolTier, number> = {
  tier_50: 50,
  tier_100: 100,
  tier_200: 200,
  tier_500_plus: 500,
}

export const SCHOOL_TIER_LABELS: Record<SchoolTier, string> = {
  tier_50: 'Up to 50 students',
  tier_100: 'Up to 100 students',
  tier_200: 'Up to 200 students',
  tier_500_plus: '500+ students',
}

// Free-text, not a closed enum — an HQ admin can invent a new category
// (e.g. "Onboarding Kits") without a schema change. This is a *suggested*
// list for the upload form's dropdown, not an exhaustive/enforced set.
export const SUGGESTED_PARTNER_RESOURCE_CATEGORIES: readonly string[] = ['Video Ads', 'Brochures', 'Sales Scripts', 'Live Training', 'Onboarding Kits']

export type PartnerResource = {
  id: string
  title: string
  description: string | null
  category: string
  fileUrl: string
  fileType: string | null
  scheduledAt: string | null
  displayOrder: number
  isPublished: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}
