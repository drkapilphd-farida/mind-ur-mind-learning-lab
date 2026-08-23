import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThirtyDayMasterclassHeroCard } from '@/components/dashboard/ThirtyDayMasterclassHeroCard'
import { LiveMasterclassWaitlistCard } from '@/app/unified-quantum-session-preview/components/LiveMasterclassWaitlistCard'
import { ParentDashboard } from '@/features/parent-dashboard/components/ParentDashboard'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Live Masterclasses & Mentorship',
}

// Pillar 1 — Live Masterclasses & Mentorship™ (3-Pillar Command Center,
// Phase 4). No real live-batch schedule, countdown, or session-recording
// system exists anywhere in this codebase, so this hub stays honest about
// that: real 30-Day Masterclass enrollment + a real waitlist for the next
// live batch, both already-built self-contained widgets, plus the real
// Parents Dashboard as a tab — zero fabricated schedule/countdown/
// recordings content.
export default async function MasterclassesPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/masterclasses')

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
