'use client'

import { useLayoutEffect } from 'react'

// True Full-Screen Viewport Lock™ — locks document.body itself (via the
// .exercise-active class, globals.css) for as long as this hook is
// mounted with enabled=true. This is defense-in-depth on top of the
// fixed inset-0 overlay every exercise layout already renders
// (ReadingLayout.tsx, ExercisePracticeLayout.tsx, DayMasterPlayer.tsx):
// some mobile browsers resolve pull-to-refresh/rubber-band-bounce
// gestures above the DOM's own event handling, so a fixed full-screen
// overlay on top of an otherwise-normal, scrollable body doesn't always
// suppress them — only locking the real scroll root does.
//
// Preserves and restores the exact scroll position across the lock
// (position: fixed on body would otherwise visually snap the page to
// the top the instant it locks, and leave it there after unlocking) —
// the classic body-scroll-lock bug this specifically avoids. Safe to
// call from multiple mounted instances (e.g. DayMasterPlayer locking
// once per wizard session while each embedded exercise's own
// ReadingLayout/ExercisePracticeLayout passes enabled=false and skips
// it) since it's a plain class + inline `top` toggle, not a counter.
//
// `enabled` (default true) exists so callers that are ALWAYS mounted
// but only sometimes want the lock (e.g. an embedded exercise layout
// that defers locking to its parent wizard) can call this hook
// unconditionally, satisfying the rules of hooks, while the lock itself
// only actually applies when true.
export function useImmersiveExerciseLock(enabled: boolean = true): void {
  useLayoutEffect(() => {
    if (!enabled) return
    if (typeof document === 'undefined') return

    const scrollY = window.scrollY
    const body = document.body

    body.classList.add('exercise-active')
    body.style.top = `-${scrollY}px`

    return () => {
      body.classList.remove('exercise-active')
      body.style.top = ''
      window.scrollTo(0, scrollY)
    }
  }, [enabled])
}
