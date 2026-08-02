import { Sunrise, Sun, Sunset, Moon, type LucideIcon } from 'lucide-react'
import type { TimeOfDayName } from '../colorSceneTransformationDataset'

const TIME_OF_DAY_ICONS: Record<TimeOfDayName, LucideIcon> = {
  dawn: Sunrise,
  day: Sun,
  dusk: Sunset,
  night: Moon,
}

// Icon colors chosen per time-of-day for contrast against that
// background's own pale-vs-deep tone, not a single fixed color.
const TIME_OF_DAY_ICON_COLORS: Record<TimeOfDayName, string> = {
  dawn: '#db2777',
  day: '#ffffff',
  dusk: '#ffffff',
  night: '#e0e7ff',
}

type SceneTransformationDisplayProps = {
  backgroundHex: string
  timeOfDayName: TimeOfDayName | undefined
  prefersReducedMotion: boolean
}

// The single visual anchor of every round: one card whose background
// color smoothly transitions (a real CSS `transition-colors`, not a
// snap-cut) as the narrated chain advances step by step — this is what
// makes the "chromatic transitions" the brief asks for genuinely visible,
// not just described in text. For time-of-day rounds a small icon rides
// along on top, swapping instantly (icon identity doesn't need to
// interpolate, only the background color does).
export function SceneTransformationDisplay({
  backgroundHex,
  timeOfDayName,
  prefersReducedMotion,
}: SceneTransformationDisplayProps): React.JSX.Element {
  const Icon = timeOfDayName === undefined ? null : TIME_OF_DAY_ICONS[timeOfDayName]
  const iconColor = timeOfDayName === undefined ? undefined : TIME_OF_DAY_ICON_COLORS[timeOfDayName]

  return (
    <div
      className={`flex size-56 items-center justify-center rounded-2xl ring-1 ring-border/50 sm:size-64 ${
        prefersReducedMotion ? '' : 'transition-colors duration-1000 ease-in-out'
      }`}
      style={{ backgroundColor: backgroundHex }}
    >
      {Icon !== null && <Icon className="size-20 sm:size-24" style={{ color: iconColor }} aria-hidden="true" />}
    </div>
  )
}
