'use client'

import { MotionConfig } from 'framer-motion'

// Discover Your Brain™ — shared shell for every screen in this standalone
// module (Welcome today; Intrigue, Trust, etc. later). Owns the ambient
// background frame and a single MotionConfig so every future screen's
// motion.* elements automatically honor prefers-reduced-motion with no
// per-animation gating. 'use client' only for MotionConfig — page-level
// metadata still lives in each screen's own page.tsx (a Server Component),
// which Next.js merges normally regardless of this layout's component type.
export default function DiscoverYourBrainLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate flex min-h-[100dvh] items-center overflow-hidden bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[-14rem] -z-10 flex justify-center blur-3xl"
        >
          <div className="h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-violet-200 via-sky-200 to-emerald-100 opacity-50 dark:from-violet-900/30 dark:via-sky-900/20 dark:to-emerald-900/20" />
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-12 px-6 py-16 sm:py-24">{children}</div>
      </main>
    </MotionConfig>
  )
}
