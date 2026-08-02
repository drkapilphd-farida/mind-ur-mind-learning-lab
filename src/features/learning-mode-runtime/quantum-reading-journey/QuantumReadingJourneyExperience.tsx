'use client'

import { useState } from 'react'
import { QuantumJourneyHome } from './home/QuantumJourneyHome'
import { QuantumReadingJourneyController } from './QuantumReadingJourneyController'

type QuantumReadingJourneyExperienceProps = {
  documentId: string
  projectId: string
}

type View = { kind: 'home' } | { kind: 'playing'; chapterOrder: number }

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. Objective 1/2 — the learner starts the journey, not
// an exercise: Home shows the book/chapter overview; choosing "Continue
// Journey" or a specific chapter card hands off into the same, unchanged
// Quantum Reading Journey Controller (Sprint QSR-2), which still runs
// Word Flash → Progressive Chunk Reading → Reading Assessment
// automatically — the learner never picks an exercise directly.
export function QuantumReadingJourneyExperience({ documentId, projectId }: QuantumReadingJourneyExperienceProps): React.JSX.Element {
  const [view, setView] = useState<View>({ kind: 'home' })

  if (view.kind === 'home') {
    return <QuantumJourneyHome documentId={documentId} onContinue={(chapterOrder) => setView({ kind: 'playing', chapterOrder })} onSelectChapter={(chapterOrder) => setView({ kind: 'playing', chapterOrder })} />
  }

  return <QuantumReadingJourneyController documentId={documentId} projectId={projectId} initialChapterOrder={view.chapterOrder} onExitToHome={() => setView({ kind: 'home' })} />
}
