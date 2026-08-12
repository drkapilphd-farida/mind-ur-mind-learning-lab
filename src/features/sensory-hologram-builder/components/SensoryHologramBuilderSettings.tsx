'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandWatermark } from '@/components/brand/BrandWatermark'
import { Button } from '@/components/ui/button'
import {
  HOLOGRAM_CATEGORIES,
  HOLOGRAM_CATEGORY_LABELS,
  groupHologramGoalsByCategory,
  type HologramCategory,
} from '../hologramDatabase'
import type { NarrationLanguage } from '../hologramVoiceSelection'

const GOALS_BY_CATEGORY = groupHologramGoalsByCategory()

type SensoryHologramBuilderSettingsProps = {
  language: NarrationLanguage
  onSelectLanguage: (language: NarrationLanguage) => void
  selectedGoalId: string | null
  onSelectGoal: (goalId: string) => void
  onStart: () => void
}

// Settings screen: pick a spoken language, then a life goal or sensory
// anchor to build the hologram around — the two decisions that shape the
// entire guided journey (SensoryHologramBuilderCanvas.tsx derives its
// full narration script from just these two choices, via
// buildNarrationPhases(goal) and the selected language).
export function SensoryHologramBuilderSettings({
  language,
  onSelectLanguage,
  selectedGoalId,
  onSelectGoal,
  onStart,
}: SensoryHologramBuilderSettingsProps): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState<HologramCategory>(HOLOGRAM_CATEGORIES[0]!)
  const goalsInCategory = GOALS_BY_CATEGORY[activeCategory]

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center gap-8 px-6 py-16 text-center">
      <BrandWatermark className="absolute top-4 left-6" />
      <Link
        href="/labs/quantum-speed-reading"
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      >
        Exit
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Sensory Hologram Builder™</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A guided, voice-narrated journey — grounding, then sight, touch, and scent — that builds a vivid mental
          hologram of a life goal or sensory anchor you choose. About 3 to 4 minutes.
        </p>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Guidance Language</p>
        <div className="flex justify-center gap-2">
          <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => onSelectLanguage('en')}>
            English
          </Button>
          <Button variant={language === 'hi' ? 'default' : 'outline'} size="sm" onClick={() => onSelectLanguage('hi')}>
            हिंदी
          </Button>
        </div>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Category</p>
        <div className="flex flex-wrap justify-center gap-2">
          {HOLOGRAM_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                category === activeCategory
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent/20'
              }`}
            >
              {language === 'hi' ? HOLOGRAM_CATEGORY_LABELS[category].hi : HOLOGRAM_CATEGORY_LABELS[category].en}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">Choose Your Hologram</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {goalsInCategory.map((goal) => (
            <button
              key={goal.id}
              type="button"
              data-goal-id={goal.id}
              onClick={() => onSelectGoal(goal.id)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                goal.id === selectedGoalId
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent/20'
              }`}
            >
              {language === 'hi' ? goal.titleHi : goal.titleEn}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={selectedGoalId === null}
        className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {selectedGoalId === null ? 'Choose a hologram to begin' : 'Begin'}
      </button>
    </div>
  )
}
