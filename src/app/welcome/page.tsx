import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Welcome',
}

// One-Click Entry™ — every "Get Started" link across the app and
// marketing site points here, so this is the real front door. Arrival
// Experience™ (Sprint LW-1A) and the Learning Goal™ screen it led to are
// deliberately no longer in the path: both remain fully intact at
// /welcome (see ArrivalExperience.tsx, still reachable if a future flow
// wants it) and /welcome/learning-goal, just unlinked from here — the
// entry screen is now Choose Your Path™ directly, matching the locked
// "primary entry screen, two direct action cards, one click" onboarding
// spec. No auth check needed here (unlike before Gateway Auth Modal™) —
// /welcome/choose-method itself now renders for signed-out visitors too
// and gates each card's action behind a modal, so this can redirect
// unconditionally.
export default function WelcomePage(): never {
  redirect('/welcome/choose-method')
}
