import { Activity, BookOpen, MoveHorizontal, ScanEye } from 'lucide-react'
import { LockedJourneyCard } from './LockedJourneyCard'
import { TratakJourneyCard } from './TratakJourneyCard'

const LOCKED_JOURNEYS = [
  { title: 'Peripheral Vision Journey™', icon: ScanEye },
  { title: 'Eye Span Journey™', icon: MoveHorizontal },
  { title: 'Dynamic Vision Journey™', icon: Activity },
  { title: 'Reading Vision Mastery™', icon: BookOpen },
] as const

type AdvancedJourneysSectionProps = {
  isTratakUnlocked: boolean
  tratakProgressPercent: number
  tratakXp: number
  tratakLevel: number
  tratakPersistenceScore: number
}

// New, additive section on the Visual Intelligence Home, below the
// unchanged Foundation Journey™ content — the entry point to Journey-2
// (Tratak Intelligence Journey™) plus honest "Coming Soon" previews of the
// journeys planned after it.
export function AdvancedJourneysSection({
  isTratakUnlocked,
  tratakProgressPercent,
  tratakXp,
  tratakLevel,
  tratakPersistenceScore,
}: AdvancedJourneysSectionProps): React.JSX.Element {
  return (
    <div className="mt-14">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Advanced Journeys</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Continue strengthening your visual intelligence through advanced visual awareness training.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TratakJourneyCard
            isUnlocked={isTratakUnlocked}
            progressPercent={tratakProgressPercent}
            xp={tratakXp}
            level={tratakLevel}
            persistenceScore={tratakPersistenceScore}
            estimatedDurationLabel="~20 Min"
          />
        </div>
        {LOCKED_JOURNEYS.map((journey) => (
          <LockedJourneyCard key={journey.title} title={journey.title} icon={journey.icon} />
        ))}
      </div>
    </div>
  )
}
