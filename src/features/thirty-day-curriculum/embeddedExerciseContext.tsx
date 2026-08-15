'use client'

import { createContext, useContext } from 'react'

// True Full-Screen Viewport Lock™ — every embeddable exercise's Canvas
// (ReadingLayout.tsx, ExercisePracticeLayout.tsx) was built for full-page
// standalone use: its own Exit button, its own BrandWatermark, its own
// min-h-[100dvh]. That's correct when the exercise owns its own route
// (e.g. /labs/quantum-speed-reading/rsvp — no other chrome exists there).
// It's actively harmful when DayMasterPlayer.tsx embeds that same
// component in-page inside its own wizard card: the wizard already shows
// an equivalent Exit/Skip header, so the embedded exercise's own
// min-h-[100dvh] + duplicate header stacked underneath it was forcing
// the page to be taller than one screen and scroll — exactly the mobile
// bug this context exists to fix. DayMasterPlayer provides `true` only
// while rendering an embedded step; every standalone route never
// provides it at all, so useIsEmbeddedExercise() defaults to false and
// those routes are completely unaffected.
const EmbeddedExerciseContext = createContext(false)

export function EmbeddedExerciseProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <EmbeddedExerciseContext.Provider value={true}>{children}</EmbeddedExerciseContext.Provider>
}

export function useIsEmbeddedExercise(): boolean {
  return useContext(EmbeddedExerciseContext)
}
