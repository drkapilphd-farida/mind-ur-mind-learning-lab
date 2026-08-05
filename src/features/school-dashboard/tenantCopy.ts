import type { SchoolType } from './types'

export type TenantCopy = {
  entityLabel: string
  entityLabelLower: string
  groupLabel: string
  groupLabelPlural: string
  adminRoleLabel: string
  staffRoleLabel: string
  portalPath: string
  nameFieldLabel: string
  namePlaceholder: string
}

// Every shared school-dashboard component (CreateClassForm, AddStudentForm,
// the portal home page, master-admin create form) takes a `tenantType`
// prop and reads its copy from here instead of hardcoding "School"/
// "Class" — a franchise partner is the exact same underlying data model
// (see schema comment in 20260805000003_add_franchise_partner_support.sql),
// just labeled differently.
export const TENANT_COPY: Record<SchoolType, TenantCopy> = {
  school: {
    entityLabel: 'School',
    entityLabelLower: 'school',
    groupLabel: 'Class',
    groupLabelPlural: 'Classes',
    adminRoleLabel: 'School Admin',
    staffRoleLabel: 'Teacher',
    portalPath: '/school-admin',
    nameFieldLabel: 'School name',
    namePlaceholder: 'Greenwood International School',
  },
  franchise_partner: {
    entityLabel: 'Academy',
    entityLabelLower: 'academy',
    groupLabel: 'Batch',
    groupLabelPlural: 'Batches',
    adminRoleLabel: 'Partner',
    staffRoleLabel: 'Team Member',
    portalPath: '/partner-admin',
    nameFieldLabel: 'Academy / brand name',
    namePlaceholder: 'Bright Minds Learning Academy',
  },
}
