import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { UpdateProfileForm } from '@/features/user/components/UpdateProfileForm'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Dashboard layout redirects unauthenticated users
  if (!user) return <div />

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name ?? ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account details.
        </p>
      </div>

      <Separator />

      <div className="max-w-md space-y-6">
        <div>
          <h2 className="text-base font-medium">Profile</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Update your public display name.
          </p>
        </div>

        <UpdateProfileForm defaultFullName={fullName} />

        <Separator />

        <div>
          <h2 className="text-base font-medium">Account</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Email address:{' '}
            <span className="text-foreground font-medium">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
