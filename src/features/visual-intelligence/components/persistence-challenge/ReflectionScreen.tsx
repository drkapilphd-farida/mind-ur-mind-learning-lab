'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { ReflectionResponse } from '../../persistence-challenge/persistenceChallengeTypes'
import { ReflectionChoiceGrid } from './ReflectionChoiceGrid'

type ReflectionScreenProps = {
  onSelect: (response: ReflectionResponse) => void
}

const REFLECTION_OPTIONS: readonly { value: ReflectionResponse; label: string }[] = [
  { value: 'bright-image', label: 'Bright image' },
  { value: 'dim-image', label: 'Dim image' },
  { value: 'colours-changed', label: 'Colours changed' },
  { value: 'nothing-noticeable', label: 'Nothing noticeable' },
]

export function ReflectionScreen({ onSelect }: ReflectionScreenProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center', fadeClass)}>
      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Reflection</p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">What did you notice?</h1>
      </div>
      <ReflectionChoiceGrid options={REFLECTION_OPTIONS} onSelect={(value) => onSelect(value as ReflectionResponse)} />
    </div>
  )
}
