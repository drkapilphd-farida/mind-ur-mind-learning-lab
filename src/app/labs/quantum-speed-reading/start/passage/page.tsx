import type { Metadata } from 'next'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getPassagesByCategory, type PassageCategory } from '@/features/quantum-speed-reading/passageLibrary'
import {
  PASSAGE_CATEGORY_LABEL,
  PASSAGE_CATEGORY_DESCRIPTION,
  PASSAGE_CATEGORY_ICON,
  PASSAGE_DIFFICULTY_LABEL,
  PASSAGE_DIFFICULTY_DESCRIPTION,
  type PassageDifficulty,
} from '@/features/quantum-speed-reading/passageDifficulty'
import { PassageCard } from '@/features/quantum-speed-reading/components/PassageCard'
import { SprintStepIndicator } from '@/features/quantum-speed-reading/components/SprintStepIndicator'

export const metadata: Metadata = {
  title: 'Choose a Passage — Quantum Speed Reading™',
}

type PassageSelectPageProps = {
  searchParams: Promise<{ mode?: string | undefined; category?: string | undefined; difficulty?: string | undefined }>
}

const CATEGORIES: readonly PassageCategory[] = [
  'science', 'history', 'psychology', 'biography', 'business', 'technology', 'motivation', 'general-knowledge',
]
const DIFFICULTIES: readonly PassageDifficulty[] = ['easy', 'medium', 'hard']

function isPassageCategory(value: string | undefined): value is PassageCategory {
  return CATEGORIES.includes(value as PassageCategory)
}

function isPassageDifficulty(value: string | undefined): value is PassageDifficulty {
  return DIFFICULTIES.includes(value as PassageDifficulty)
}

// Screen 3 — category and difficulty selection are plain search-param links
// (no client state), matching the existing courses catalog filter
// convention already used elsewhere in this app. "Adaptive" is shown as a
// real, named, disabled option — never a fake/fabricated tier with no
// content behind it. Category cards intentionally show icon + description
// only (no reading-time/word-count/difficulty) — those stats are real only
// per-passage, not per-category, and appear on the PassageCard below.
export default async function PassageSelectPage({ searchParams }: PassageSelectPageProps): Promise<React.JSX.Element> {
  const params = await searchParams
  const modeQuery = params.mode ? `mode=${params.mode}&` : ''
  const activeCategory: PassageCategory = isPassageCategory(params.category) ? params.category : 'science'
  const activeDifficulty: PassageDifficulty = isPassageDifficulty(params.difficulty) ? params.difficulty : 'easy'

  const passages = getPassagesByCategory(activeCategory).filter((passage) => passage.difficulty === activeDifficulty)

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <SprintStepIndicator currentStep={3} />

      <div className="mt-10 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          Choose a Passage
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Pick a topic that interests you, then a comfortable challenge level.
        </p>
      </div>

      <div className="mt-12">
        <p className="text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">Category</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Filter by category">
          {CATEGORIES.map((category) => {
            const Icon = PASSAGE_CATEGORY_ICON[category]
            const isActive = category === activeCategory
            return (
              <Link
                key={category}
                href={`?${modeQuery}category=${category}&difficulty=${activeDifficulty}`}
                aria-current={isActive ? 'true' : undefined}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className={cn(
                    'flex h-full flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-all duration-300 group-hover:-translate-y-0.5',
                    isActive
                      ? 'bg-foreground text-background shadow-md'
                      : 'bg-muted/40 text-foreground ring-1 ring-foreground/10 group-hover:ring-foreground/20',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg',
                      isActive ? 'bg-background/15' : 'bg-background/70',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold">{PASSAGE_CATEGORY_LABEL[category]}</span>
                  <span className={cn('text-[10px] leading-snug', isActive ? 'text-background/70' : 'text-muted-foreground')}>
                    {PASSAGE_CATEGORY_DESCRIPTION[category]}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mt-10">
        <p className="text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">Difficulty</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4" role="group" aria-label="Filter by difficulty">
          {DIFFICULTIES.map((difficulty) => {
            const isActive = difficulty === activeDifficulty
            return (
              <Link
                key={difficulty}
                href={`?${modeQuery}category=${activeCategory}&difficulty=${difficulty}`}
                aria-current={isActive ? 'true' : undefined}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className={cn(
                    'flex h-full flex-col gap-1 rounded-xl px-4 py-3 text-left transition-all duration-300 group-hover:-translate-y-0.5',
                    isActive
                      ? 'bg-foreground text-background shadow-md'
                      : 'bg-muted/40 text-foreground ring-1 ring-foreground/10 group-hover:ring-foreground/20',
                  )}
                >
                  <span className="text-sm font-semibold">{PASSAGE_DIFFICULTY_LABEL[difficulty]}</span>
                  <span className={cn('text-[11px] leading-snug', isActive ? 'text-background/70' : 'text-muted-foreground')}>
                    {PASSAGE_DIFFICULTY_DESCRIPTION[difficulty]}
                  </span>
                </div>
              </Link>
            )
          })}
          <div
            className="flex h-full cursor-not-allowed flex-col gap-1 rounded-xl px-4 py-3 text-left opacity-40 ring-1 ring-foreground/10"
            aria-disabled="true"
          >
            <span className="text-sm font-semibold">Adaptive</span>
            <span className="text-[11px] leading-snug text-muted-foreground">Coming in a future update</span>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {passages.map((passage) => (
          <PassageCard
            key={passage.id}
            passage={passage}
            href={`/labs/quantum-speed-reading/start/prepare?${modeQuery}passage=${passage.id}`}
          />
        ))}
      </div>
    </div>
  )
}
