'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CurriculumAssessmentCanvas } from './CurriculumAssessmentCanvas'
import { MasterclassPaywallModal } from './MasterclassPaywallModal'
import { ThirtyDayCurriculumDayDetail } from './ThirtyDayCurriculumDayDetail'
import { ThirtyDayCurriculumOverview } from './ThirtyDayCurriculumOverview'
import { TOTAL_CURRICULUM_DAYS } from '../curriculumDatabase'
import { isCurriculumDayUnlocked, loadCurriculumProgress, recordCurriculumCheckpoint, type CurriculumCheckpointResult } from '../curriculumProgress'
import { syncCurriculumDayCompletion } from '../actions/syncCurriculumDayCompletion'

type CurriculumView = 'overview' | 'day-detail' | 'assessment'

function getMostRecentTrueWpm(day: number): number | null {
  const progress = loadCurriculumProgress()
  const priorCheckpoints = Object.values(progress.checkpoints)
    .filter((checkpoint) => checkpoint.day < day)
    .sort((a, b) => b.day - a.day)
  return priorCheckpoints[0]?.trueWpm ?? null
}

function parseValidDay(rawDay: string | null): number | null {
  if (rawDay === null) return null
  const day = Number(rawDay)
  return Number.isInteger(day) && day >= 1 && day <= TOTAL_CURRICULUM_DAYS ? day : null
}

// Root client orchestrator — a single route, client-state-driven view
// machine (Overview <-> Day Detail <-> Assessment) rather than per-day
// dynamic routes, mirroring QuantumJourneySession.tsx's own
// local-`level`-state approach. `refreshKey` forces the Overview to
// re-read localStorage after any mutation (mark-complete or a recorded
// checkpoint) without needing a shared store — the same "bump a key to
// force a re-read" trick this project already uses wherever a sibling
// component owns the write.
//
// In-Page Step-by-Step Master Player™ — this is also the landing point a
// real browser navigation returns to whenever DayMasterPlayer had to hand
// off to one of the 16 server-gated exercises (see
// curriculumGatedExercises.ts): curriculumReturnRouting.ts encodes
// `?view=day&day=N[&dayComplete=1]` into the URL it redirects back to,
// and the initial view state here is derived from those params (read
// once, on mount) so the day view — and, if that gated exercise was the
// playlist's final step, the completion celebration — survives that one
// real page round-trip. Every other, embeddable exercise never leaves
// this route at all; see DayMasterPlayer.tsx.
type ThirtyDayCurriculumExperienceProps = {
  // 30-Day Masterclass Paywall™ — resolved server-side (see this
  // route's page.tsx, hasQuantumSpeedReadingProAccess) and passed down
  // as the one real source of truth every gate in this component tree
  // reads from. Never re-derived client-side.
  isPro: boolean
}

export function ThirtyDayCurriculumExperience({ isPro }: ThirtyDayCurriculumExperienceProps): React.JSX.Element {
  const searchParams = useSearchParams()
  const initialDay = searchParams.get('view') === 'day' ? parseValidDay(searchParams.get('day')) : null

  const [progress, setProgress] = useState(() => loadCurriculumProgress())
  // Defense in depth — `?view=day&day=N` is a real, legitimate URL this
  // app itself generates (curriculumReturnRouting.ts, returning from a
  // gated exercise mid-day), but it's also just a URL anyone could type
  // or bookmark. Validating it against the exact same
  // isCurriculumDayUnlocked gate every click already goes through means
  // landing here with an actually-locked day can never skip straight to
  // real content — it resolves to the overview with the paywall already
  // open instead.
  const initialDayIsUnlocked = initialDay !== null && isCurriculumDayUnlocked(initialDay, progress, isPro)

  const [view, setView] = useState<CurriculumView>(initialDayIsUnlocked ? 'day-detail' : 'overview')
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDayIsUnlocked ? initialDay : null)
  const [justCompletedDay, setJustCompletedDay] = useState(initialDayIsUnlocked && searchParams.get('dayComplete') === '1')
  const [paywallDay, setPaywallDay] = useState<number | null>(initialDay !== null && !initialDayIsUnlocked ? initialDay : null)
  const [refreshKey, setRefreshKey] = useState(0)

  function refreshProgress(): void {
    setProgress(loadCurriculumProgress())
    setRefreshKey((key) => key + 1)
  }

  function openPaywall(day: number): void {
    setPaywallDay(day)
  }

  // The one real gate every entry into a day's content passes through —
  // DayCell only ever calls this for a day it already knows is
  // unlocked, but this re-checks anyway rather than trusting the caller,
  // the same "never trust the client-side hint alone" discipline this
  // gate itself was built to enforce.
  function handleSelectDay(day: number): void {
    if (!isCurriculumDayUnlocked(day, progress, isPro)) {
      openPaywall(day)
      return
    }
    setSelectedDay(day)
    setJustCompletedDay(false)
    setView('day-detail')
  }

  function handleBackToOverview(): void {
    refreshProgress()
    setView('overview')
    setSelectedDay(null)
    setJustCompletedDay(false)
  }

  function handleLaunchAssessment(day: number): void {
    setSelectedDay(day)
    setView('assessment')
  }

  function handleAssessmentComplete(result: CurriculumCheckpointResult): void {
    recordCurriculumCheckpoint(result)
    void syncCurriculumDayCompletion({
      day: result.day,
      rawWpm: result.rawWpm,
      trueWpm: result.trueWpm,
      comprehensionAccuracyPercent: result.comprehensionAccuracyPercent,
    })
    refreshProgress()
    setView('day-detail')
  }

  if (view === 'assessment' && selectedDay !== null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <CurriculumAssessmentCanvas day={selectedDay} mostRecentTrueWpm={getMostRecentTrueWpm(selectedDay)} onComplete={handleAssessmentComplete} />
      </div>
    )
  }

  if (view === 'day-detail' && selectedDay !== null) {
    return (
      <ThirtyDayCurriculumDayDetail
        day={selectedDay}
        progress={progress}
        justCompletedDay={justCompletedDay}
        onBack={handleBackToOverview}
        onLaunchAssessment={handleLaunchAssessment}
      />
    )
  }

  // 3-Pillar Command Center™ (Phase 6) — this route now lives under the
  // (dashboard) route group, so the Overview (day-list) screen gets the
  // global AppSidebar/Topbar automatically instead of its own LabNavHeader.
  // Day Detail and Assessment stay chrome-free on purpose — both are fully
  // immersive (DayMasterPlayer renders `fixed inset-0`, own back arrow
  // built in; see ThirtyDayCurriculumDayDetail.tsx), the same
  // no-persistent-chrome-during-play convention every other exercise in
  // this app already follows; the fixed overlay covers the sidebar
  // regardless, so there's no conflict during play either.
  return (
    <>
      <ThirtyDayCurriculumOverview onSelectDay={handleSelectDay} onLockedDayClick={openPaywall} isPro={isPro} refreshKey={refreshKey} />
      <MasterclassPaywallModal open={paywallDay !== null} onOpenChange={(open) => { if (!open) setPaywallDay(null) }} day={paywallDay} />
    </>
  )
}
