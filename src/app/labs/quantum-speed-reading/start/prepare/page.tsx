import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPassageById } from '@/features/quantum-speed-reading/passageLibrary'
import {
  PASSAGE_CATEGORY_LABEL,
  PASSAGE_DIFFICULTY_LABEL,
  estimateReadingTimeSec,
  estimateWpm,
  formatReadingTime,
  type PassageDifficulty,
} from '@/features/quantum-speed-reading/passageDifficulty'
import { PreReadingChecklist } from '@/features/quantum-speed-reading/components/PreReadingChecklist'
import { SprintStepIndicator } from '@/features/quantum-speed-reading/components/SprintStepIndicator'

export const metadata: Metadata = {
  title: 'Prepare to Read — Quantum Speed Reading™',
}

type PreReadingPreparePageProps = {
  searchParams: Promise<{ mode?: string | undefined; passage?: string | undefined }>
}

// Short/Medium/Long is a display label for the same difficulty tier that
// already determines each passage's real word count in passageLibrary.ts —
// not a new fabricated metric, just a plainer way to describe it here.
const PASSAGE_LENGTH_LABEL: Record<PassageDifficulty, string> = {
  easy: 'Short',
  medium: 'Medium',
  hard: 'Long',
}

// Screen 4 — every field here is real, derived from the chosen passage's
// own wordCount and difficulty (passageDifficulty.ts), never fabricated. A
// missing/invalid passage id 404s rather than guessing.
export default async function PreReadingPreparePage({ searchParams }: PreReadingPreparePageProps): Promise<React.JSX.Element> {
  const params = await searchParams
  const passage = params.passage ? getPassageById(params.passage) : null
  if (!passage) notFound()

  const readingTimeSec = estimateReadingTimeSec(passage.wordCount, passage.difficulty)
  const wpm = estimateWpm(passage.difficulty)
  const modeQuery = params.mode ? `mode=${params.mode}&` : ''
  const nextHref = `/labs/quantum-speed-reading/start/read?${modeQuery}passage=${passage.id}`

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <SprintStepIndicator currentStep={4} />

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Prepare to Read</h1>
        <p className="mt-2 text-sm text-muted-foreground">Today&apos;s Session</p>
        <p className="text-base font-semibold text-foreground">{passage.title}</p>
      </div>

      <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-3 text-left text-xs">
        <dt className="text-muted-foreground">Estimated Time</dt>
        <dd className="text-right font-medium text-foreground">{formatReadingTime(readingTimeSec)}</dd>
        <dt className="text-muted-foreground">Reading Goal</dt>
        <dd className="text-right font-medium text-foreground">{wpm} WPM · Full comprehension</dd>
        <dt className="text-muted-foreground">Difficulty</dt>
        <dd className="text-right font-medium text-foreground">{PASSAGE_DIFFICULTY_LABEL[passage.difficulty]}</dd>
        <dt className="text-muted-foreground">Category</dt>
        <dd className="text-right font-medium text-foreground">{PASSAGE_CATEGORY_LABEL[passage.category]}</dd>
        <dt className="text-muted-foreground">Passage Length</dt>
        <dd className="text-right font-medium text-foreground">{PASSAGE_LENGTH_LABEL[passage.difficulty]}</dd>
        <dt className="text-muted-foreground">Word Count</dt>
        <dd className="text-right font-medium text-foreground">{passage.wordCount} words</dd>
      </dl>

      <PreReadingChecklist nextHref={nextHref} />
    </div>
  )
}
