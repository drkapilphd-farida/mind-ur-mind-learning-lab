import { CreateClassForm } from './CreateClassForm'
import { AddStudentForm } from './AddStudentForm'
import { TENANT_COPY } from '../tenantCopy'
import { SCHOOL_TIER_LABELS, type School, type SchoolClass } from '../types'

type TenantHomeContentProps = {
  school: School
  classes: readonly SchoolClass[]
  studentCount: number
}

// Shared by /school-admin and /partner-admin — a franchise partner's
// home page is structurally identical to a school's (same classes/
// students sections), just relabeled via TENANT_COPY.
export function TenantHomeContent({ school, classes, studentCount }: TenantHomeContentProps): React.JSX.Element {
  const copy = TENANT_COPY[school.type]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{school.name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {SCHOOL_TIER_LABELS[school.tier]} · {studentCount} / {school.maxStudents} students
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{copy.groupLabelPlural}</h2>
        {classes.length === 0 ? (
          <p className="text-muted-foreground mb-4 text-sm">No {copy.groupLabelPlural.toLowerCase()} yet — add one to start enrolling students.</p>
        ) : (
          <ul className="mb-4 divide-y rounded-xl border">
            {classes.map((schoolClass) => (
              <li key={schoolClass.id} className="px-4 py-3 text-sm font-medium">
                {schoolClass.name}
              </li>
            ))}
          </ul>
        )}
        <CreateClassForm schoolId={school.id} tenantType={school.type} />
      </div>

      {classes.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Add a student</h2>
          <AddStudentForm schoolId={school.id} schoolSlug={school.slug} classes={classes} tenantType={school.type} />
        </div>
      )}
    </div>
  )
}
