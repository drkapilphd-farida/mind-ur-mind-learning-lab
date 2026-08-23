import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ParentDashboard } from '@/features/parent-dashboard/components/ParentDashboard'
import { getActiveMasterclasses, splitMasterclassesByStatus } from '@/features/live-masterclass/queries/getActiveMasterclasses'
import { UpcomingCohortSchedule } from '@/features/live-masterclass/components/UpcomingCohortSchedule'
import { RecordedMasterclassVault } from '@/features/live-masterclass/components/RecordedMasterclassVault'
import { MentorGuidanceCard } from '@/features/live-masterclass/components/MentorGuidanceCard'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Live Masterclasses & Mentorship',
}

// Pillar 1 — Live Member Training Hub™. Member-Exclusive Simplification™:
// this used to also carry public enrollment copy (₹4,999 CTA, a WhatsApp
// promo banner, a reviews link) — all of that moves to a future public
// landing page, out of scope here. This tab now assumes the visitor is
// already a member and shows only real, admin-authored data from the
// `masterclasses` table (supabase/migrations/20260823000001_create_
// masterclasses.sql, 20260823162303_add_join_url_to_masterclasses.sql):
// the next live cohort's schedule/join link, the recorded vault, and a
// direct way to reach Dr. Kapil. Both sections render an honest empty
// state when the table has no matching rows — never a fabricated
// placeholder. Parents Dashboard stays a real tab either way.
export default async function MasterclassesPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/masterclasses')

  const allSessions = await getActiveMasterclasses()
  const { upcoming, recorded } = splitMasterclassesByStatus(allSessions)

  return (
    <div className="space-y-6">
      <div>
        <p className={TYPOGRAPHY.label}>Pillar 1</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>🔴 Live Masterclasses & Mentorship</h1>
        <p className={cn(TYPOGRAPHY.body, 'mt-2 text-muted-foreground')}>Your live cohort schedule, recorded sessions, and direct mentor access.</p>
      </div>

      <Tabs defaultValue="masterclass">
        <TabsList>
          <TabsTrigger value="masterclass">Masterclass</TabsTrigger>
          <TabsTrigger value="parents">Parents Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="masterclass" className="space-y-4 pt-4 sm:space-y-6">
          <UpcomingCohortSchedule sessions={upcoming} />
          <RecordedMasterclassVault sessions={recorded} />
          <MentorGuidanceCard />
        </TabsContent>

        <TabsContent value="parents" className="pt-4">
          <ParentDashboard userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
