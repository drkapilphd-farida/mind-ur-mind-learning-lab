'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { CHILDREN, PARENT_NAME, getWeeklySnapshot } from '../mockData'
import { ChildSwitcher } from './ChildSwitcher'
import { NotificationBanner } from './NotificationBanner'
import { QuickStatsGrid } from './QuickStatsGrid'
import { AIInsightsCard } from './AIInsightsCard'
import { ShareToWhatsAppButton } from './ShareToWhatsAppButton'
import { PremiumUpsellCard } from './PremiumUpsellCard'

// Parents Dashboard™ — the single client component that owns which
// child is currently selected (`useState`, not URL state — a page
// reload always lands back on the first child, matching the simple
// "pick a kid, look at their week" mental model this dashboard is for).
// Every child component below is a pure, presentational function of
// `snapshot` — swapping mockData.ts for a real Server Action later
// means changing only this one file, not the components themselves.
export function ParentDashboard(): React.JSX.Element {
  const [selectedChildId, setSelectedChildId] = useState<string>(CHILDREN[0]!.id)
  const selectedChild = CHILDREN.find((child) => child.id === selectedChildId) ?? CHILDREN[0]!
  const snapshot = getWeeklySnapshot(selectedChildId)
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header & Multi-Child Profile Switcher — English throughout,
            matching every other string on this dashboard. Subtitle
            names whichever child is currently selected, so it stays
            accurate across a switch rather than reading as a generic
            leftover greeting. */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              Hello, {PARENT_NAME} 👋
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Here&rsquo;s how {selectedChild.name}&rsquo;s progress looks this week
            </p>
          </div>
          <ChildSwitcher childProfiles={CHILDREN} selectedChildId={selectedChildId} onSelectChild={setSelectedChildId} />
        </div>

        {/* In-App Notification Card */}
        <NotificationBanner
          childName={selectedChild.name}
          onViewReport={() => toast.info(`Opening ${selectedChild.name}'s full weekly report…`)}
        />

        {/* Smooth Transition on Child Switch — everything below is a
            function of `snapshot`, so keying this one wrapper on
            `selectedChildId` is enough to fade the whole block out/in
            on every switch instead of an abrupt data jump.
            `mode="wait"` holds the exit animation until it finishes
            before the next child's content enters, so the two never
            cross-fade into a jumbled mess. Skips straight to the end
            state for prefers-reduced-motion, matching this app's
            existing convention (usePrefersReducedMotion) everywhere
            else motion is used. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedChildId}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Visual Quick Stats & Metrics Grid */}
            <QuickStatsGrid snapshot={snapshot} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {/* AI Weakness & Strength Analyzer */}
                <AIInsightsCard snapshot={snapshot} />

                {/* Share to WhatsApp */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Share This Week&rsquo;s Progress</h3>
                    <p className="mt-1 text-xs text-slate-500">Send {selectedChild.name}&rsquo;s report straight to family on WhatsApp.</p>
                  </div>
                  <ShareToWhatsAppButton childName={selectedChild.name} snapshot={snapshot} />
                </div>
              </div>

              {/* Premium Conversion Upsell — content is identical
                  regardless of which child is selected, but stays
                  inside the same grid/fade wrapper as the stats so the
                  whole row transitions as one unit rather than the
                  upsell card visibly holding still while everything
                  beside it fades. */}
              <PremiumUpsellCard onUpgrade={() => toast.info('Redirecting to upgrade flow…')} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
