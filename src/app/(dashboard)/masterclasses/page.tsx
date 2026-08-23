import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThirtyDayMasterclassHeroCard } from '@/components/dashboard/ThirtyDayMasterclassHeroCard'
import { LiveMasterclassWaitlistCard } from '@/app/unified-quantum-session-preview/components/LiveMasterclassWaitlistCard'
import { ParentDashboard } from '@/features/parent-dashboard/components/ParentDashboard'
import { getActiveMasterclasses } from '@/features/live-masterclass/queries/getActiveMasterclasses'
import { LiveMasterclassSessionsList } from '@/features/live-masterclass/components/LiveMasterclassSessionsList'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Live Masterclasses & Mentorship',
}

// Pillar 1 — Live Masterclasses & Mentorship™. Phase 5 wires this hub to
// the real `masterclasses` table (supabase/migrations/
// 20260823000001_create_masterclasses.sql) — when Dr. Kapil Dev Sharma's
// team has scheduled real sessions, they render above the fold as an
// actual session list. Nothing is fabricated when the table is empty
// (today's default state, since no authoring UI exists yet): the hub
// falls back cleanly to the same honest 30-Day Masterclass enrollment +
// waitlist cards it already had, never a fake "no classes" placeholder.
// Parents Dashboard stays a real tab either way.
export default async function MasterclassesPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/masterclasses')

  const activeSessions = await getActiveMasterclasses()

  return (
    <div className="space-y-6">
      <div>
        <p className={TYPOGRAPHY.label}>Pillar 1</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>🔴 Live Masterclasses & Mentorship</h1>
        <p className={cn(TYPOGRAPHY.body, 'mt-2 text-muted-foreground')}>
          Dr. Kapil Dev Sharma&apos;s 30-Day Masterclass, live-batch coaching, and your Parents Dashboard — all in one place.
        </p>
      </div>

      <Tabs defaultValue="masterclass">
        <TabsList>
          <TabsTrigger value="masterclass">Masterclass</TabsTrigger>
          <TabsTrigger value="parents">Parents Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="masterclass" className="space-y-4 pt-4 sm:space-y-6">
          {activeSessions.length > 0 && <LiveMasterclassSessionsList sessions={activeSessions} />}
          <ThirtyDayMasterclassHeroCard />
          <LiveMasterclassWaitlistCard />
        </TabsContent>

        <TabsContent value="parents" className="pt-4">
          <ParentDashboard userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
