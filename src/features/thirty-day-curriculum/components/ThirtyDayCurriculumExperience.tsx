'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LabNavHeader } from '@/features/quantum-speed-reading/components/shell/LabNavHeader'
import { CurriculumAssessmentCanvas } from './CurriculumAssessmentCanvas'
import { ThirtyDayCurriculumDayDetail } from './ThirtyDayCurriculumDayDetail'
import { ThirtyDayCurriculumOverview } from './ThirtyDayCurriculumOverview'
import { TOTAL_CURRICULUM_DAYS } from '../curriculumDatabase'
import { loadCurriculumProgress, recordCurriculumCheckpoint, type CurriculumCheckpointResult } from '../curriculumProgress'

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
export function ThirtyDayCurriculumExperience(): React.JSX.Element {
  const searchParams = useSearchParams()
  const initialDay = searchParams.get('view') === 'day' ? parseValidDay(searchParams.get('day')) : null

  const [view, setView] = useState<CurriculumView>(initialDay !== null ? 'day-detail' : 'overview')
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDay)
  const [justCompletedDay, setJustCompletedDay] = useState(initialDay !== null && searchParams.get('dayComplete') === '1')
  const [refreshKey, setRefreshKey] = useState(0)
  const [progress, setProgress] = useState(() => loadCurriculumProgress())

  function refreshProgress(): void {
    setProgress(loadCurriculumProgress())
    setRefreshKey((key) => key + 1)
  }

  function handleSelectDay(day: number): void {
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

  // Persistent Nav™ — LabNavHeader only on the Overview (day-list)
  // screen: this route had NO header at all before, a real dead end for
  // mobile nav (no way back to the dashboard, no Sign Out). Day Detail
  // and Assessment stay header-free on purpose — both are fully
  // immersive (DayMasterPlayer renders `fixed inset-0`, own back arrow
  // built in; see ThirtyDayCurriculumDayDetail.tsx), the same
  // no-persistent-chrome-during-play convention every other exercise in
  // this app already follows.
  return (
    <>
      <LabNavHeader currentSection="30-Day Masterclass" />
      <ThirtyDayCurriculumOverview onSelectDay={handleSelectDay} refreshKey={refreshKey} />
    </>
  )
}
