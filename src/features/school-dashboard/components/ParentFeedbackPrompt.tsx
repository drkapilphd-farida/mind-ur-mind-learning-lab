import { getSchoolForUser } from '../queries/getSchoolForUser'
import { TENANT_COPY } from '../tenantCopy'
import { ParentFeedbackWidget } from './ParentFeedbackWidget'

// Self-contained and self-fetching by design — drops into /dashboard
// (the same page every individual consumer account also lands on) with
// no props and no changes to that page's own already-large data-fetch.
// Renders nothing for the common case (a regular consumer account with
// no tenant membership at all), and nothing for tenant staff (only an
// active 'student' member — see is_active_student() in the migration —
// is asked; a parent has no separate login in this schema, so the
// student's own account is the closest available identity).
export async function ParentFeedbackPrompt(): Promise<React.JSX.Element | null> {
  const membership = await getSchoolForUser()

  if (membership === null || membership.member.role !== 'student') {
    return null
  }

  const { school } = membership
  const copy = TENANT_COPY[school.type]

  return <ParentFeedbackWidget schoolId={school.id} schoolName={school.name} entityLabel={copy.entityLabel} />
}
