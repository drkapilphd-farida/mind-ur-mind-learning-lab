import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { UpdateProfileForm } from '@/features/user/components/UpdateProfileForm'
import { UpdatePasswordForm } from '@/features/user/components/UpdatePasswordForm'
import { listRetakeableAssessments } from '@/features/quantum-speed-reading-runtime/assessment/actions/listRetakeableAssessments'
import { RetakeAssessmentButton } from '@/features/quantum-speed-reading-runtime/assessment/components/RetakeAssessmentButton'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div />

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name ?? ''
  const retakeableAssessments = await listRetakeableAssessments(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account details.
        </p>
      </div>

      <Separator />

      <div className="max-w-md space-y-8">
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-medium">Profile</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Update your public display name.
            </p>
          </div>
          <UpdateProfileForm defaultFullName={fullName} />
        </section>

        <Separator />

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-medium">Password</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Choose a new password for your account.
            </p>
          </div>
          <UpdatePasswordForm />
        </section>

        {retakeableAssessments.length > 0 && (
          <>
            <Separator />

            <section className="space-y-4">
              <div>
                <h2 className="text-base font-medium">Reading Assessment</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Retake your Quantum Speed Reading assessment for a document to re-measure how you read it.
                </p>
              </div>
              <ul className="space-y-3">
                {retakeableAssessments.map((assessment) => (
                  <li key={assessment.documentId} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground">{assessment.projectTitle}</span>
                    <RetakeAssessmentButton documentId={assessment.documentId} />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <Separator />

        <section className="space-y-2">
          <h2 className="text-base font-medium">Account</h2>
          <p className="text-muted-foreground text-sm">
            Email:{' '}
            <span className="text-foreground font-medium">{user.email}</span>
          </p>
        </section>
      </div>
    </div>
  )
}
